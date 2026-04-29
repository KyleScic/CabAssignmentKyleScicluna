import bookingModel from "../models/bookingModel.js";

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
        res.status(201).json({message: "Booking created successfully", booking: newCreatedBooking});

    } catch (error){
        res.status(500).json({message: "Failed to create booking", error: error.message});
    }
}