import bookingModel from "../models/booking.model.js";


export const getCurrentBooking = async(req, res) => {
    try{
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const bookings = await bookingModel.find({
            date: {
                $gte: now,
                $lte: oneHourLater
            }
        });


       if(!bookings.length === 0){
           res.status(404).json({error: "Booking not found"});
       }

        res.status(200).json({message: "Booking found", bookings: bookings});


    } catch (error) {
        res.status(400).json({error: "Error getting booking info"});
    }
}


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