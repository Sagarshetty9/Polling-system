import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;


export const registerController = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }else if(await User.findOne({email})) {
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({username, email, password: hashedPassword});
        await newUser.save();
        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET);
        res.status(201).json({message: "User registered successfully", user: newUser, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}