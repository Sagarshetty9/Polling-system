//Login and register logic

import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();


export const loginController =  async (req, res) => {

    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({message: "Email and password are required"});
    }

   try {
     const user = await User.findOne({email})

     if(!user){
        return res.status(401).json({message: "Invalid email or password"})
     }

    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
        return res.status(401).json({message : "invalid credentials"})
    }
    
    const token = jwt.sign({
        userId: user._id,
        username: user.username
        }, 
        process.env.JWT_SECRET, 
        {expiresIn: "24h"}
        );

    res.status(200).json({message: "Login successful", userId: user._id, token: token});

   } catch (error) {
      res.status(500).json({ message: "Server error" });
   }

}


export const registerController = async (req, res) => {

    const saltRounds = 10;
    try {
        const {username, email, password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        } 
        
        if(await User.findOne({email})) {
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({username, email, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET);
        res.status(201).json({message: "User registered successfully", user: newUser, token: token});
    }catch (error) {
            console.error(error);
            res.status(500).json({message: "Internal server error", error: error.message});
    }
}