

import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  durationMinutes: { type: Number, default: 60, min: 1 },
  expiresAt: { type: Date },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  userVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }],
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Poll', pollSchema);
