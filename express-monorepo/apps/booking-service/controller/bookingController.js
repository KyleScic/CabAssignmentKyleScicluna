import bookingModel from '../models/bookingModel.js';
import amqp from 'amqplib';


const emitEvent = async (queueName, eventType, data) => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });

        const eventMessage = { eventType, data };
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(eventMessage)));

        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error(`Failed to emit ${eventType} to RabbitMQ:`, error);
    }
};


export const createBooking = async (req, res) => {
    const { startingLocation, endingLocation, date, time, passengers, cabType } = req.body;

    try {
        if (!startingLocation || !endingLocation || !date || !time || !passengers || !cabType) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const userId = req.body.userId || "user_123";

        const newCreatedBooking = new bookingModel({
            email,
            startingLocation,
            endingLocation,
            date,
            time,
            passengers,
            cabType,
            status: 'pending'
        });

        await newCreatedBooking.save();


        await emitEvent('booking_events', 'BOOKING_CREATED', newCreatedBooking);

        res.status(201).json({ message: "Booking received and is processing", booking: newCreatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Failed to create booking", error: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await bookingModel.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Failed to fetch booking", error: error.message });
    }
};


export const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;


        const booking = await bookingModel.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }


        const completedCount = await bookingModel.countDocuments({
            userId: booking.email,
            status: 'completed'
        });


        await emitEvent('booking_events', 'BOOKING_COMPLETED', booking);


        if (completedCount === 3) {
            await emitEvent('discount_events', 'DISCOUNT_ELIGIBLE', { userId: booking.userId });
        }

        res.status(200).json({ message: "Booking completed successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Failed to complete booking", error: error.message });
    }
};