import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bookingRoutes from "./routes/bookingRoutes.js";


dotenv.config();


const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;



app.use('/api/booking',bookingRoutes);

mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB Connected');
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}).catch((err) => {
    console.error('MongoDB Connection Error:', err);
});








