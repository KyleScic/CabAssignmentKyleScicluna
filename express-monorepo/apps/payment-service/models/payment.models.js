import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);