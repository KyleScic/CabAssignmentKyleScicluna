import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        startingLocation: {
            type: String,
            required: true,
            trim: true,
        },
        endingLocation: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        passengers: {
            type: Number,
            required: true,
            min: 1,
        },
        cabType: {
            type: String,
            required: true,
            enum: ['Economic', 'Premium', 'Executive'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
