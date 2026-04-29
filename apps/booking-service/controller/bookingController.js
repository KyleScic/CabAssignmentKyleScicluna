import bookingModel from "../models/bookingModel.js";
import amqp from 'amqplib';

export const getBookings = async (req,res) => {
    try{
        const bookings = await bookingModel.find({});

        if(!bookings || bookings.length === 0){
            res.status(404).json({message: "No bookings found"});
        }

        const formattedBookings = bookings.map(booking => ({
            startingLocation: booking.startingLocation,
            endingLocation: booking.endingLocation,
            date: booking.date,
            time: booking.time,
            passengers: booking.passengers,
            cabType: booking.cabType
        }));

        res.status(200).json({
            message: "Bookings fetched successfully",
            bookings: formattedBookings
        });
    }catch (error){
        res.status(500).json({message: "Failed to fetch bookings", error: error.message});
    }
}

export const createBooking = async (req,res) =>{
    const {startingLocation, endingLocation, date, time, passengers, cabType} = req.body;
    try{
        if(!startingLocation || !endingLocation || !date || !time || !passengers || !cabType){
            return res.status(400).json({message: "Please provide all required fields"});
        }
        const newCreatedBooking = new bookingModel({
            startingLocation,
            endingLocation,
            date,
            time,
            passengers,
            cabType
        });

        await newCreatedBooking.save();

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'booking_events';
        await channel.assertQueue(queueName, {durable: true});

        const eventMessage = {
            eventType: 'BOOKING_CREATED',
            data: newCreatedBooking
        };

        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(eventMessage)));
        setTimeout(() => connection.close(), 500);

        res.status(201).json({message: "Booking received and is processing", booking: newCreatedBooking});

    } catch (error){
        res.status(500).json({message: "Failed to create booking", error: error.message});
    }
}