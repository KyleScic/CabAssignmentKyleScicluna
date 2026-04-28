import express from 'express';
import {createBooking, getCurrentBooking} from "../controllers/booking.controller.js";


const router = express.Router();



router.post('/',createBooking) //creates booking
router.get('/current', getCurrentBooking);

export default router;