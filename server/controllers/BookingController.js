import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe'

const checkSeatsAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) {
            return false;
        }
        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;

    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const createCheckoutSession = async (booking, movie, origin) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.create({
        success_url: `${origin}/loading/my-bookings`,
        cancel_url: `${origin}/my-bookings`,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }],
        mode: 'payment',
        metadata: {
            bookingId: booking._id.toString()
        },
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60
    });

    booking.paymentLink = session.url;
    await booking.save();
    return session.url;
};


export const createBooking = async (req, res) => {
    let booking;
    let showData;
    let userId;
    let seatsReserved = false;


    try {
        
        ({ userId } = req.auth());
        const { showId, selectedSeats } = req.body;
        const {origin}= req.headers ;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("Booking unavailable: STRIPE_SECRET_KEY is not configured.");
            return res.status(503).json({
                success: false,
                message: "Payments are not configured. Please contact support."
            });
        }
        if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0 ||
            new Set(selectedSeats).size !== selectedSeats.length) {
            return res.status(400).json({ success: false, message: "Provide a show and a non-empty list of unique seats." });
        }

        // check if seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
        if (!isAvailable) {
            return res.json({
                success: false, message: "Selected Seats are not available."
            })
        }

        // Get the show details
        showData = await Show.findById(showId).populate('movie');
        if (!showData || !showData.movie) {
            return res.status(404).json({ success: false, message: "Show or movie not found." });
        }

        // create the new booking
        booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
        })
        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');
        seatsReserved = true;
        await showData.save();

        const url = await createCheckoutSession(booking, showData.movie, origin);
        
        await inngest.send({
            name:"app/checkpayment",
            data:{
                bookingId : booking._id.toString()
            }
        })


        return res.json({
            success: true,
            bookingId: booking._id,
            url
        })

    } catch (error) {
        if (booking && !booking.isPaid) {
            if (seatsReserved && showData) {
                booking.bookedSeats.forEach((seat) => {
                    if (showData.occupiedSeats[seat] === userId) {
                        delete showData.occupiedSeats[seat];
                    }
                });
                showData.markModified("occupiedSeats");
                try {
                    await showData.save();
                } catch (cleanupError) {
                    console.error("Could not release seats after booking failed:", cleanupError);
                }
            }
            try {
                await Booking.findByIdAndDelete(booking._id);
            } catch (cleanupError) {
                console.error("Could not remove booking after creation failed:", cleanupError);
            }
        }

        console.log(error.message);
        return res.status(500).json({
            success: false, message: error.message
        })
    }
}

export const payForBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("Booking unavailable: STRIPE_SECRET_KEY is not configured.");
            return res.status(503).json({
                success: false,
                message: "Payments are not configured. Please contact support."
            });
        }

        const origin = req.headers.origin;
        if (!origin) {
            return res.status(400).json({
                success: false,
                message: "Unable to determine the checkout return address."
            });
        }

        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            user: userId
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }
        if (booking.isPaid) {
            return res.status(409).json({
                success: false,
                message: "This booking has already been paid."
            });
        }

        const showData = await Show.findById(booking.show).populate('movie');
        if (!showData?.movie) {
            return res.status(404).json({
                success: false,
                message: "Show or movie not found."
            });
        }

        const url = await createCheckoutSession(booking, showData.movie, origin);
        return res.json({ success: true, url });
    } catch (error) {
        console.error("Could not start booking payment:", error);
        return res.status(500).json({
            success: false,
            message: "Could not start payment. Please try again."
        });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({
            success: true,
            occupiedSeats
        })


    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}