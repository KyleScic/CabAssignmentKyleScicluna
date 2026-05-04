import locationModel from "../models/location.model.js";

const fetchWeather = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error("Weather API error:", error);
        return null;
    }
};

export const addLocation = async (req, res) => {
    try {
        const { userId, name, address, latitude, longitude } = req.body;

        if (!userId || !name || !latitude || !longitude) {
            return res.status(400).json({ error: "Missing required fields (userId, name, latitude, longitude)" });
        }

        const newLocation = new locationModel({
            userId,
            name,
            address,
            latitude,
            longitude
        });

        const savedLocation = await newLocation.save();

        res.status(201).json(savedLocation);
    } catch (error) {
        console.error("Error adding location:", error);
        res.status(500).json({ error: "Failed to add favourite location" });
    }
};

export const getLocations = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required to fetch locations" });
        }

        const locations = await locationModel.find({ userId: userId });

        res.status(200).json(locations);
    } catch (error) {
        console.error("Error retrieving locations:", error);
        res.status(500).json({ error: "Failed to retrieve locations" });
    }
};

export const getLocationById = async (req, res) => {
    try {
        const locationId = req.params.id;


        const location = await locationModel.findById(locationId);

        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error("Error retrieving location:", error);
        res.status(500).json({ error: "Failed to retrieve location" });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const locationId = req.params.id;
        const updates = req.body;

        const updatedLocation = await locationModel.findByIdAndUpdate(
            locationId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedLocation) {
            return res.status(404).json({ error: "Location not found" });
        }

        res.status(200).json(updatedLocation);
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ error: "Failed to update location" });
    }
};

export const removeLocation = async (req, res) => {
    try {
        const locationId = req.params.id;

        const deletedLocation = await locationModel.findByIdAndDelete(locationId);

        if (!deletedLocation) {
            return res.status(404).json({ error: "Location not found" });
        }

        res.status(200).json({ message: "Favourite location removed successfully", deletedLocation });
    } catch (error) {
        console.error("Error removing location:", error);
        res.status(500).json({ error: "Failed to remove location" });
    }
};

export const getLocationWeatherById = async (req, res) => {
    try {
        const locationId = req.params.id;


        const location = await locationModel.findById(locationId).lean();

        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }


        const weather = await fetchWeather(location.latitude, location.longitude);


        res.status(200).json({
            ...location,
            weather
        });

    } catch (error) {
        console.error("Error retrieving single location weather:", error);
        res.status(500).json({ error: "Failed to retrieve weather data" });
    }
};