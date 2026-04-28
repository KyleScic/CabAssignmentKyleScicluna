import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    startLocation: { type: String, required: true },
    endLocation:   { type: String, required: true },
    date:          { type: Date,   required: true },
    numberOfPassengers: { type: Number, required: true },
    cabType:       { type: String, required: true, enum: ['economy', 'business', 'luxury'] },
    email:         { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);