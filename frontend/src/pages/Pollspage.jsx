import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useSocket } from "../api/socketContext";
import { IoMenu } from "react-icons/io5";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Members from "../components/PollsComponent/Members";
import Polls from "../components/PollsComponent/Polls";
import Pollsarea from "../components/PollsComponent/Pollsarea";
import Polldialog from "../components/PollsComponent/Polldialog";

const Pollspage = () => {
  const { teamId } = useParams();
  const socket = useSocket();
  const [teamData, setTeamData] = useState(null);
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isDeletingPoll, setIsDeletingPoll] = useState(false);

  // 1. Central API Fetcher for Polls
  const fetchTeamPolls = useCallback(async ({ selectLatest = false } = {}) => {
    if (!teamId) return [];
    try {
      const { data } = await apiClient.get(`/polls/teamPoll/${teamId}`);
      const fetchedPolls = data || [];

      setPolls(fetchedPolls);
      setActivePoll((currentActivePoll) => {
        if (!fetchedPolls.length) return null;
        if (selectLatest) return fetchedPolls[0];

        // Sync our currently viewed active poll with fresh database vote numbers
        const updatedActivePoll = fetchedPolls.find(
          (poll) => poll._id === currentActivePoll?._id
        );
        return updatedActivePoll || fetchedPolls[0];
      });

      return fetchedPolls;
    } catch (error) {
      console.error("Error running background poll fetch:", error);
    }
  }, [teamId]);

  // 2. Initial Page Load Fetcher (Team details & initial polls)
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [teamRes] = await Promise.all([
          apiClient.get(`/teams/myTeams/${teamId}`),
          fetchTeamPolls({ selectLatest: true }),
        ]);
        setTeamData(teamRes.data?.team || null);
      } catch (error) {
        console.error("Error fetching polls page data:", error);
      }
    };
    if (teamId) fetchPageData();
  }, [teamId, fetchTeamPolls]);

  // 3. Real-time Live Synchronization Listener
  useEffect(() => {
    if (!socket || !teamId) return;

    // Join the secure team room channel
    socket.emit("join_poll_room", teamId.toString());

    // When someone else votes or creates, instantly reload from the DB
    socket.on("poll_created", () => {
      fetchTeamPolls({ selectLatest: true });
    });

    socket.on("poll_voted", () => {
      fetchTeamPolls();
    });

    // Clean up channel links when leaving the view
    return () => {
      socket.off("poll_created");
      socket.off("poll_voted");
    };
  }, [teamId, socket, fetchTeamPolls]);

  // 4. Action Handler: Submitting a Local Vote
  const handleVote = async (optionId) => {
    try {
      if (!activePoll?._id || !optionId) return;

      const { data: updatedPoll } = await apiClient.patch(`/polls/${activePoll._id}/vote`, {
        optionId,
      });

      setPolls((prevPolls) =>
        prevPolls.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
      );
      setActivePoll(updatedPoll);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // 5. Action Handler: Creating a New Poll
  const handleCreatePoll = async (payload) => {
    try {
      if (!teamId) return false;
      setIsCreatingPoll(true);

      const { data: createdPoll } = await apiClient.post(`/polls/createPoll/${teamId}`, payload);
      setPolls((prev) => {
        const exists = prev.some((poll) => poll._id === createdPoll._id);
        if (exists) {
          return prev.map((poll) => (poll._id === createdPoll._id ? createdPoll : poll));
        }
        return [createdPoll, ...prev];
      });
      setActivePoll(createdPoll);
      setDialogOpen(false);
      toast.success("Poll created");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create poll");
      return false;
    } finally {
      setIsCreatingPoll(false);
    }
  };

  // 6. Action Handler: Deordinating a Poll
  const handleDeletePoll = async () => {
    try {
      if (!activePoll?._id) return;
      setIsDeletingPoll(true);

      await apiClient.delete(`/polls/${activePoll._id}`);
      setPolls((prev) => {
        const remaining = prev.filter((poll) => poll._id !== activePoll._id);
        setActivePoll(remaining[0] || null);
        return remaining;
      });
      toast.success("Poll deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete poll");
    } finally {
      setIsDeletingPoll(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Top Utility Nav Card */}
      <Card className="border shadow-sm">
        <CardHeader className="relative py-5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute left-4 top-1/2 -translate-y-1/2"
            onClick={() => setDialogOpen(true)}
            aria-label="Open team menu"
          >
            <IoMenu className="size-5" />
          </Button>
          {activePoll?._id && (
            <Button
              type="button"
              variant="destructive"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={handleDeletePoll}
              disabled={isDeletingPoll}
            >
              {isDeletingPoll ? "Deleting..." : "Delete Poll"}
            </Button>
          )}
          <CardTitle className="text-center text-base tracking-widest uppercase flex items-center justify-center gap-2">
            <span>Team {teamData?.teamName || "Loading..."}</span>
            <span 
              className={`inline-block size-2 rounded-full ${socket ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} 
              title={socket ? 'Real-time pipeline online' : 'Real-time offline'} 
            />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Creation Modal */}
      <Polldialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreatePoll={handleCreatePoll}
        isSubmitting={isCreatingPoll}
        teamName={teamData?.teamName}
      />

      {/* Main Column Framework Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        <aside className="lg:col-span-3">
          <Members members={teamData?.members || []} />
        </aside>

        <main className="lg:col-span-6">
          <Pollsarea activePoll={activePoll} onVote={handleVote} />
        </main>

        <aside className="lg:col-span-3">
          <Polls polls={polls} activePollId={activePoll?._id} onSelectPoll={setActivePoll} />
        </aside>
      </div>
    </div>
  );
};

export default Pollspage;