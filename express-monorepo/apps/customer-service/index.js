import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/user.routes.js';
import {listenForDiscounts} from "./listeners/discountListener.js";

dotenv.config();


const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;


app.use('/api/users',userRouter);

mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB Connected');
    app.listen(port, async () => {
        console.log(`Server started on port ${port}`);
        await listenForDiscounts();
    });
}).catch((err) => {
    console.error('MongoDB Connection Error:', err);
});








