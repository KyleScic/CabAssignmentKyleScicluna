import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import Payment from '../payment-service/models/payment.models.js';

async function listenForEvents(){
    try{
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = "payment_events";
        await channel.assertQueue(queueName, {durable: true});

        console.log(`Waiting for messages in ${queueName}...`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());

                if (event.eventType === 'FARE_CALCULATED') {
                    console.log(`Received fare for booking ${event.data.bookingId}. Saving as PAID.`);
                    try {
                        const newPayment = new Payment({
                            bookingId: event.data.bookingId,
                            amount: event.data.totalFare,
                        });

                        await newPayment.save();
                    } catch (error){
                        console.log(error);
                    }
                }
                channel.ack(msg);

            }
        })
    } catch (error){
        console.error('Error listening for events:', error);
    }
}


dotenv.config();


const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;


listenForEvents();




mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB Connected');
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}).catch((err) => {
    console.error('MongoDB Connection Error:', err);
});








