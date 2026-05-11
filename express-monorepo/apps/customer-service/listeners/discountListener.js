import amqp from 'amqplib';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

export const listenForDiscounts = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
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

                        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

                        if (!user) {

                            console.log(`[!] Ignored: User ${email} not found in Customer Database.`);
                        } else if (user.discountAwarded) {

                            console.log(`[-] Ignored: User ${email} already received their discount.`);
                        } else {

                            const notification = new Notification({
                                userId: user._id,
                                title: "Congratulations!",
                                message: "You've completed a booking! Enjoy a 10% discount on your next ride.",
                                isRead: false
                            });
                            await notification.save();


                            user.discountAwarded = true;
                            await user.save();

                            console.log(`[✔] SUCCESS: Processed discount for user: ${user.email}`);
                        }


                        channel.ack(msg);
                    } catch (dbError) {
                        console.error("Database error processing discount:", dbError);
                        channel.ack(msg);
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