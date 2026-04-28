import bookingModel from "../models/booking.model.js";


export const createBooking = async(req,res)=>{ //User is created
    try{
        const {startLocation, endLocation, date, numberOfPassengers, cabType, email} = req.body;

        const newBooking = await bookingModel.create({
            startLocation,
            endLocation,
            date,
            numberOfPassengers,
            cabType,
            email
        });



        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    }catch(err){
        res.status(400).json({message: "failed to create booking", error: err});
    }
}