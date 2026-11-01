
import { Inngest } from "inngest";
import User from "../models/user.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import stripe from "stripe";

// Create Inngest client
export const inngest = new Inngest({
    id: "movie-ticket-booking"
});

// Function to save a newly created Clerk user
const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
        triggers: [{ event: "clerk/user.created" }]
    },
    async ({ event }) => {
        const {
            id,
            first_name,
            last_name,
            email_addresses,
            image_url
        } = event.data;

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        };

        await User.create(userData);
    }
);

// Function to delete a Clerk user
const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-from-clerk",
        triggers: [{ event: "clerk/user.deleted" }]
    },
    async ({ event }) => {
        const { id } = event.data;

        await User.findByIdAndDelete(id);
    }
);

// Function to update a Clerk user
const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
        triggers: [{ event: "clerk/user.updated" }]
    },
    async ({ event }) => {
        const {
            id,
            first_name,
            last_name,
            email_addresses,
            image_url
        } = event.data;

        const userData = {
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        };

        await User.findByIdAndUpdate(id, userData);
    }
);

// Function to cancel booking and release seats
// after 10 minutes if payment is not completed
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {
        id: "release-seats-delete-booking",
        triggers: [{ event: "app/checkpayment" }]
    },
    async ({ event, step }) => {

        const tenMinutesLater = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await step.sleepUntil(
            "wait-for-10-minutes",
            tenMinutesLater
        );

        await step.run("check-payment-status", async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return;
            }

            if (booking.isPaid) {
                return;
            }

            if (!booking.stripeSessionId || !process.env.STRIPE_SECRET_KEY) {
                throw new Error(
                    `Cannot verify Stripe payment for booking ${bookingId}.`
                );
            }

            const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
            let session = await stripeInstance.checkout.sessions.retrieve(
                booking.stripeSessionId
            );

            if (session.payment_status === "paid") {
                const paidBooking = await Booking.findOneAndUpdate(
                    { _id: bookingId, isPaid: false },
                    { isPaid: true, paymentLink: "" },
                    { new: true }
                );

                if (paidBooking) {
                    await inngest.send({
                        name: "app/show.booked",
                        data: { bookingId }
                    });
                }
                return;
            }

            if (session.status === "open") {
                session = await stripeInstance.checkout.sessions.expire(
                    booking.stripeSessionId
                );
            }

            if (session.status !== "expired" || session.payment_status === "paid") {
                throw new Error(
                    `Stripe session ${booking.stripeSessionId} is not safe to cancel booking ${bookingId}.`
                );
            }

            const show = await Show.findById(booking.show);

            if (!show) {
                throw new Error(`Show ${booking.show} not found for booking ${bookingId}.`);
            }

            booking.bookedSeats.forEach((seat) => {
                if (show.occupiedSeats[seat] === booking.user) {
                    delete show.occupiedSeats[seat];
                }
            });

            show.markModified("occupiedSeats");

            await show.save();

            await Booking.findOneAndDelete({ _id: booking._id, isPaid: false });
        });
    }
);


// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {
        id: "send-booking-confirmation-email",
        triggers: [{ event: "app/show.booked" }]
    },
    async ({ event, step }) => {

        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId)
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                    model: "Movie"
                }
            })
            .populate("user");

        // Add your email sending logic here
        await sendEmail({
            to: booking.user.email,
            subject: `Booking Confirmation :"${booking.show.movie.title}"  booked !`,
           body: ` <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${booking.user.name},</h2>

        <p>
            Your booking for
            <strong style="color: #F84565;">
                ${booking.show.movie.title}
            </strong>
            is confirmed.
        </p>

        <p>
            <strong>Date:</strong>
            ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', {
                timeZone: 'Asia/Kolkata'
            })}
            <br/>

            <strong>Time:</strong>
            ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata'
            })}
        </p>

        <p>Enjoy the show! 🍿</p>

        <p>
            Thanks for booking with us!<br/>
            — QuickShow Team
        </p>
    </div>`
        })

    }
);



// Export all Inngest functions
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail];
