import mongoose from 'mongoose';
import User from './userSchema.js';

const teamSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);