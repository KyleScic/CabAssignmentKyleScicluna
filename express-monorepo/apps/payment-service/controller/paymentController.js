

export const createPayment = async(req,res)=>{ //User is created
    try{
        const {name, email, password} = req.body;
        const newUser = await userModel.create({name, email, password});

        res.status(201).send(newUser);
    }catch(err){
        res.status(400).json({message: "failed to create user"});
    }
}