
import stripe from "stripe";
import Booking from '../models/Booking.js'
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_KEY
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }


try {
    switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded":
        case "payment_intent.succeeded": {
            let session;
            if (event.type === "payment_intent.succeeded") {
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: event.data.object.id,
                    limit: 1
                });
                session = sessionList.data[0];
                if (!session) {
                    throw new Error(
                        `No Checkout session found for payment intent ${event.data.object.id}.`
                    );
                }
            } else {
                session = event.data.object;
            }

            if (session.payment_status !== "paid") {
                break;
            }

            const bookingId = session.metadata?.bookingId;
            if (!bookingId) {
                throw new Error(`Checkout session ${session.id} has no bookingId metadata.`);
            }

            const booking = await Booking.findOneAndUpdate(
                { _id: bookingId, isPaid: false },
                { isPaid: true, paymentLink: "" },
                { new: true }
            );

            if (booking) {
                await inngest.send({
                    name: "app/show.booked",
                    data: { bookingId }
                });
            }
            break;
        }

        default:
            break;
    }
    response.json({received:true})
} catch (err) {
    console.error("Webhook processing error" , err);
    response.status(500).send("Internal Server Error");
}


};
