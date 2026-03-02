import Team from "../model/teamSchema.js";
import User from "../model/userSchema.js";

const normalizeTeamName = (value = "") => value.trim().replace(/\s+/g, " ");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findTeamByName = (teamName) => {
  const normalized = normalizeTeamName(teamName);
  const nameRegex = new RegExp(`^${escapeRegex(normalized)}$`, "i");
  return Team.findOne({ teamName: nameRegex });
};




const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user.userId })
      .sort({ createdAt: -1 })
      .select("teamName owner members createdAt");

    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error: error.message });
  }
};





const createTeamController = async (req, res) => {
  try {
    const { teamName } = req.body;
    const normalizedName = normalizeTeamName(teamName);

    if (!normalizedName) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const existingTeam = await findTeamByName(normalizedName);
    if (existingTeam) {
      return res.status(409).json({ message: "Team name already exists" });
    }

    const newTeam = await Team.create({
      teamName: normalizedName,
      owner: req.user.userId,
      members: [req.user.userId],
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { teams: newTeam._id },
    });

    res.status(201).json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
};





const joinTeamController = async (req, res) => {
  try {
    const { teamName } = req.body;
    const normalizedName = normalizeTeamName(teamName);

    if (!normalizedName) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = await findTeamByName(normalizedName);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const alreadyMember = team.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );

    if (alreadyMember) {
      return res.status(200).json({ message: "Already joined this team", team });
    }

    await Team.findByIdAndUpdate(team._id, {
      $addToSet: { members: req.user.userId },
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { teams: team._id },
    });

    const updatedTeam = await Team.findById(team._id).select(
      "teamName owner members createdAt"
    );

    res.status(200).json({ message: "Joined team successfully", team: updatedTeam });
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({ message: "Server error" });
  }
};





const leaveTeamController = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.owner.toString() === req.user.userId) {
      return res.status(400).json({ message: "Team owner cannot leave the team" });
    }

    await Team.findByIdAndUpdate(teamId, {
      $pull: { members: req.user.userId },
    });

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { teams: teamId },
    });

    res.status(200).json({ message: "Left team successfully", teamId });
  } catch (error) {
    console.error("Error leaving team:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const getTeamByIdController = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).select("teamName owner members createdAt");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (!team.members.some((memberId) => memberId.toString() === req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const populatedTeam = await Team.findById(teamId)
      .select("teamName owner members createdAt")
      .populate("members", "username name");

    res.status(200).json({ team: populatedTeam });
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};






export { createTeamController, getMyTeams, joinTeamController, leaveTeamController, getTeamByIdController };
