import express from 'express';
import {createBooking, getBookings} from "../controller/bookingController.js";

const router = express.Router();

router.post('/',createBooking)
router.get('/', getBookings);

export default router;