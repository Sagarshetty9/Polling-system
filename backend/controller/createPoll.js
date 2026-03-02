import Poll from '../model/pollingSchema.js';
import Team from '../model/teamSchema.js';

const createPoll = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { question, options = [], durationMinutes = 60 } = req.body;

    
    const team = await Team.findOne({ _id: teamId, members: req.user.userId });
    if (!team) return res.status(403).json({ message: "Team not found or Access Denied" });

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!Array.isArray(options)) {
      return res.status(400).json({ message: "Options must be an array" });
    }
  
    const formattedOptions = options
      .filter(opt => opt.trim() !== "") 
      .map(opt => ({ text: opt }));

    if (formattedOptions.length < 2) {
      return res.status(400).json({ message: "Provide at least 2 options" });
    }

    const safeDuration = Math.max(1, Number(durationMinutes) || 60);
    const poll = new Poll({
      teamId,
      question: question.trim(),
      options: formattedOptions,
      durationMinutes: safeDuration,
      creator: req.user.userId,
      expiresAt: new Date(Date.now() + safeDuration * 60000)
    });

    await poll.save();

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getTeamPolls = async (req, res) => {
  try {
    const { teamId } = req.params;
    const polls = await Poll.find({ teamId });

    const pollsWithSelection = polls.map((poll) => {
      const selectedVote = (poll.userVotes || []).find(
        (vote) => vote.userId.toString() === req.user.userId
      );

      const pollData = poll.toObject();
      pollData.selectedOptionId = selectedVote?.optionId?.toString() || null;
      return pollData;
    });

    res.json(pollsWithSelection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const votePollOption = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ message: 'Invalid Option' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const team = await Team.findById(poll.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized for this team' });
    }

    const selectedOption = poll.options.id(optionId);
    if (!selectedOption) {
      return res.status(404).json({ message: 'Option not found' });
    }

    if (!poll.userVotes) {
      poll.userVotes = [];
    }



    const existingVote = poll.userVotes.find(
      (vote) => vote.userId.toString() === req.user.userId
    );

    if (existingVote) {
      const previousOptionId = existingVote.optionId?.toString();
      if (previousOptionId !== optionId.toString()) {
        const previousOption = poll.options.id(previousOptionId);
        if (previousOption && previousOption.votes > 0) {
          previousOption.votes -= 1;
        }
        selectedOption.votes += 1;
        existingVote.optionId = optionId;
      }
    } else {
      selectedOption.votes += 1;
      poll.userVotes.push({
        userId: req.user.userId,
        optionId,
      });
    }

    await poll.save();

    const updatedPoll = poll.toObject();
    updatedPoll.selectedOptionId = optionId.toString();

    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const deletePoll = async (req, res) => {
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










export { createPoll, getTeamPolls, votePollOption, deletePoll };
