//Logic for Polls system

import { getIO } from '../config/socket.js';
import Poll from '../model/pollingSchema.js'; 
import Team from '../model/teamSchema.js';

// Helper to normalize poll data for frontend (convert ObjectIds to strings and find user vote)
const normalizePoll = (poll, currentUserId) => {
  if (!poll) return null;
  const pollObj = typeof poll.toObject === 'function' ? poll.toObject() : poll;
  
  // Find current user's vote
  const userVotes = pollObj.userVotes || [];
  const selectedVote = userVotes.find(
    (vote) => vote.userId?.toString() === currentUserId?.toString()
  );
  
  return {
    ...pollObj,
    _id: pollObj._id?.toString(),
    teamId: pollObj.teamId?.toString(),
    creator: pollObj.creator?.toString(),
    selectedOptionId: selectedVote?.optionId?.toString() || null,
    options: (pollObj.options || []).map((opt) => ({
      ...opt,
      _id: opt._id?.toString(),
      votes: Number(opt.votes) || 0
    })),
    userVotes: userVotes.map((v) => ({
      ...v,
      userId: v.userId?.toString(),
      optionId: v.optionId?.toString()
    }))
  };
};

//CREATE POLL CONTROLLER

export const createPoll = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { question, options = [] } = req.body;

    if (!question || options.length < 2) {
      return res.status(400).json({ message: "Invalid poll" });
    }

    const poll = new Poll({
      teamId,
      question: question.trim(),
      options: options.map((o) => ({ text: o })),
      creator: req.user.userId,
    });

    await poll.save();

    const io = getIO();

    io.to(teamId.toString()).emit("poll_created", {
      poll,
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//GET TEAM POLLS CONTROLLER

export const getTeamPolls = async (req, res) => {
  try {
    const { teamId } = req.params;
    const polls = await Poll.find({ teamId }).sort({ createdAt: -1 });

    const normalizedPolls = polls.map((poll) => normalizePoll(poll, req.user.userId));

    res.json(normalizedPolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




//VOTE IN A POLL CONTROLLER

export const votePollOption = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.userId;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const selectedOption = poll.options.id(optionId);
    if (!selectedOption)
      return res.status(404).json({ message: "Option not found" });

    if (!poll.userVotes) poll.userVotes = [];

    const existingVote = poll.userVotes.find(
      (v) => v.userId.toString() === userId.toString()
    );

    if (existingVote) {
      const prevOption = poll.options.id(existingVote.optionId);

      if (prevOption && prevOption.votes > 0) {
        prevOption.votes -= 1;
      }

      if (existingVote.optionId.toString() !== optionId.toString()) {
        selectedOption.votes += 1;
        existingVote.optionId = optionId;
      }
    } else {
      selectedOption.votes += 1;
      poll.userVotes.push({ userId, optionId });
    }

    await poll.save();

    // 🔥 IMPORTANT: reload fresh data
    const updatedPoll = await Poll.findById(pollId);

    const io = getIO();

    // ✅ BROADCAST FULL UPDATE TO ROOM
    io.to(poll.teamId.toString()).emit("poll_voted", {
      poll: updatedPoll,
    });

    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//DELETE POLL CONTROLLER

export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this poll' });
    }
    
    await Poll.findByIdAndDelete(pollId);

    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






