import amqp from 'amqplib';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

export const listenForDiscounts = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'discount_events';
        await channel.assertQueue(queueName, { durable: true });

        console.log(`[*] Waiting for messages in ${queueName}.`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());

                if (event.eventType === 'DISCOUNT_ELIGIBLE') {
                    const { email } = event.data;

                    try {
                        const user = await User.findOne({ email: email });


                        if (user && !user.discountAwarded) {

                            const notification = new Notification({
                                userId: user._id,
                                title: "Congratulations!",
                                message: "You've completed 3 bookings! Enjoy a 10% discount on your next ride.",
                                isRead: false
                            });
                            await notification.save();


                            user.discountAwarded = true;
                            await user.save();

                            console.log(`[x] Processed discount for user: ${email}`);
                        } else {
                            console.log(`[x] Ignored discount event. User ${email} already awarded or not found.`);
                        }


                        channel.ack(msg);
                    } catch (dbError) {
                        console.error("Database error processing discount:", dbError);

                    }
                } else {

                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error("Failed to start RabbitMQ discount listener:", error);
    }
};