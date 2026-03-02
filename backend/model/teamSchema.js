import mongoose from 'mongoose';
import User from './userSchema.js';

const teamSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  // The person who created the team
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // An array of User IDs who are members
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);