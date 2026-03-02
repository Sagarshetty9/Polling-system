import mongoose from "mongoose";
import Team from "./teamSchema.js";


// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // Inside your existing userSchema in User.js
    teams: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team' 
    }]
});

export default mongoose.model("User", userSchema);