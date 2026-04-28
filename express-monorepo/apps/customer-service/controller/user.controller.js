import userModel from "../models/userModel.js";

export const createUser = async(req,res)=>{ //User is created
    try{
        const {name, email, password} = req.body;
        const newUser = await userModel.create({name, email, password});

        res.status(201).send(newUser);
    }catch(err){
        res.status(400).json({message: "failed to create user"});
    }
}

export const loginUser = async (req,res)=>{ //User Logs in
    try{
        const {email, password} = req.body;

        const user = await userModel.findOne({email});

        if(!user){
            res.status(404).json({message: "user not found"});
        }

        if(user.password !== password){
            return res.status(401).json({message: "password is incorrect"});
        }

        res.status(200).json({message: "user login successfully", user:{
            id: user._id,
                email: user.email,
                password: user.password,
                name: user.name
            }});

    } catch (err){
        res.status(400).json({message: "login failed"});
    }
}