import express from 'express';
import {completeBooking, createBooking, getBookingById} from "../controller/bookingController.js";

const router = express.Router();

router.post('/',createBooking)
router.get('/', getBookingById);
router.patch('/:id/complete', completeBooking);

export default router;