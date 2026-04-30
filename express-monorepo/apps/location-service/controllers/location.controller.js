import locationModel from "../models/location.model.js";

export const getLocation = async (req,res) => {
    try{
        const favouriteLocation = await locationModel.find({});
    }
}