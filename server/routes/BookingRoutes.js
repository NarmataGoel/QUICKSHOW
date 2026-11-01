import express from 'express';
import {
    createBooking,
    getOccupiedSeats,
    payForBooking
} from '../controllers/BookingController.js';

const bookingRouter = express.Router();

bookingRouter.post('/create',createBooking);
bookingRouter.post('/:bookingId/pay',payForBooking);
bookingRouter.get('/seats/:showId',getOccupiedSeats);

export default  bookingRouter ;