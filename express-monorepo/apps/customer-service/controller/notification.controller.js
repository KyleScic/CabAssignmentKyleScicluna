import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

export const handleDiscountEvent = async (req, res) => {
    try {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        if (user.discountAwarded) {
            return res.status(200).json({ message: "Discount already awarded previously." });
        }


        const notification = new Notification({
            userId,
            title: "Congratulations!",
            message: "You've completed 3 bookings! Enjoy a 10% discount on your next ride.",
            isRead: false
        });
        await notification.save();


        user.discountAwarded = true;
        await user.save();

        res.status(201).json({ message: "Discount notification generated successfully" });
    } catch (error) {
        console.error("Error processing discount event:", error);
        res.status(500).json({ error: "Failed to process discount event" });
    }
};