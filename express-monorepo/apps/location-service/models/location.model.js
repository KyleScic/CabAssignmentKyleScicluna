import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);