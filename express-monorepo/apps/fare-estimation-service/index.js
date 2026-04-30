import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import NodeGeocoder from 'node-geocoder';

const geocoder = NodeGeocoder({
    provider: 'openstreetmap'
});

const fareMultipliers = {
    ECONOMIC: 1,
    PREMIUM: 1.2,
    EXECUTIVE: 1.4
};

const getPassengerMultiplier = (count) => {
    if (count >= 1 && count <= 4) {
        return 1;
    } else if (count >= 5 && count <= 8) {
        return 2;
    } else {
        return 1;
    }
};

export const getTimeMultiplier = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (hours >= 0 && hours < 8) {
        return 1.2;
    } else {
        return 1;
    }
};



async function listenForEvents(){
    try{
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = "booking_events";
        await channel.assertQueue(queueName, {durable: true});

        console.log(`Waiting for messages in ${queueName}...`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());

                if (event.eventType === 'BOOKING_CREATED') {
                    console.log('Received new booking! processing payment for', event.data);

                    const originResult = await geocoder.geocode(event.data.startingLocation);

                    if (!originResult || originResult.length === 0) {
                        console.error(`Could not find starting location: ${event.data.startingLocation}`);
                        channel.ack(msg);
                        return;
                    }

                    const dep_lat = originResult[0].latitude;
                    const dep_lng = originResult[0].longitude;

                    const endingLocation = await geocoder.geocode(event.data.endingLocation);


                    if (!endingLocation || endingLocation.length === 0) {
                        console.error(`Could not find ending location: ${event.data.endingLocation}`);
                        channel.ack(msg);
                        return;
                    }

                    const arr_lat = endingLocation[0].latitude;
                    const arr_lng = endingLocation[0].longitude

                    const taxiApiUrl = `https://taxi-fare-calculator.p.rapidapi.com/search-geo?dep_lat=${dep_lat}&dep_lng=${dep_lng}&arr_lat=${arr_lat}&arr_lng=${arr_lng}`;

                    const response = await fetch(taxiApiUrl, {
                        headers: {
                            'x-rapidapi-key': '07c384e66bmsh93a843d4164542ap11b039jsnd1d33fa5962a',
                            'x-rapidapi-host': 'taxi-fare-calculator.p.rapidapi.com'
                        }
                    });

                    const fareData = await response.json();

                    const fareCost = fareData.journey.fares[0].price_in_cents
                    const cabMultiplier = fareMultipliers[event.data.cabType] || 1;
                    const peopleMultiplier = getPassengerMultiplier(event.data.passengers);
                    const timeMultiplier = getTimeMultiplier(event.data.time);
                    const totalFare = (fareCost * cabMultiplier * peopleMultiplier * timeMultiplier) / 100;

                    console.log('Fare Estimation:', totalFare);

                    const fareEvent = {
                        eventType: 'FARE_CALCULATED',
                        data: {
                            bookingId: event.data._id,
                            totalFare: totalFare,
                            startLocation: event.data.startingLocation,
                            endLocation: event.data.endingLocation,
                        }
                    };

                    const paymentQueue = "payment_events";
                    await channel.assertQueue(paymentQueue, {durable: true});
                    channel.sendToQueue(paymentQueue, Buffer.from(JSON.stringify(fareEvent)));
                    console.log('Published fare to payment service.');


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








