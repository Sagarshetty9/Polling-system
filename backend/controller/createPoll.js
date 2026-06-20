import { getIO } from '../config/socket.js';
import Poll from '../model/pollingSchema.js'; // Ensure correct imports matching your schemas
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

    // 1. Basic Validation
    if (!question || options.length < 2) {
      return res.status(400).json({ message: "Invalid question or options" });
    }

    // 2. Save the Poll to MongoDB
    const poll = new Poll({
      teamId,
      question: question.trim(),
      options: options.map(opt => ({ text: opt })),
      creator: req.user.userId
    });
    await poll.save();

    // 3. Simple Socket Broadcast
    try {
      const io = getIO();
      
      // We send a message called 'poll_created' ONLY to people inside this teamId room
      io.to(teamId.toString()).emit('poll_created', { teamId });
    } catch (socketError) {
      console.error("Socket failed, but database saved successfully:", socketError.message);
    }

    // 4. Respond to the person who clicked create
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // 1. Fetch Poll and verify existence
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const selectedOption = poll.options.id(optionId);
    if (!selectedOption) return res.status(404).json({ message: 'Option not found' });

    // 2. Process Vote (Switching vs New Vote)
    if (!poll.userVotes) poll.userVotes = [];
    const existingVote = poll.userVotes.find(v => v.userId.toString() === userId);

    if (existingVote) {
      const previousOptionId = existingVote.optionId?.toString();
      
      // If user is changing their vote to a new option
      if (previousOptionId !== optionId.toString()) {
        const previousOption = poll.options.id(previousOptionId);
        if (previousOption && previousOption.votes > 0) previousOption.votes -= 1;
        
        selectedOption.votes += 1;
        existingVote.optionId = optionId;
      }
    } else {
      // brand new vote
      selectedOption.votes += 1;
      poll.userVotes.push({ userId, optionId });
    }

    // 3. Save to Database
    await poll.save();

    // 4. Simple Socket Alert
    try {
      const io = getIO();
      // Inform the team room that a vote happened
      io.to(poll.teamId.toString()).emit('poll_voted', { pollId: poll._id });
    } catch (socketError) {
      console.error("Socket alert failed:", socketError.message);
    }

    // 5. Send raw updated poll back to the user
    res.status(200).json(poll);
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






