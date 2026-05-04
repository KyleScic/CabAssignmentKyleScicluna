import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
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
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);