 import mongoose from 'mongoose';

const locationSchema = mongoose.Schema({
    email: String,
    favouriteLocation: String,
})

 export default mongoose.model('location', locationSchema);