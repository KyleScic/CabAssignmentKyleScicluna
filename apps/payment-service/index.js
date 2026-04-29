import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import amqp from 'amqplib';

async function listenForEvents(){
    try{
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = "booking_events";
        await channel.assertQueue(queueName, {durable: true});

        console.log(`Waiting for messages in ${queueName}...`);

        channel.consume(queueName, (msg) =>{
            if(msg !== null){
                const event = JSON.parse(msg.content.toString());

                if(event.eventType === 'BOOKING_CREATED'){
                    console.log('Received new booking! processing payment for', event.data);
                    // -<
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








