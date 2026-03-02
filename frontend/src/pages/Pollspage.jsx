import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
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
  const [teamData, setTeamData] = useState(null);
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isDeletingPoll, setIsDeletingPoll] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [teamRes, pollsRes] = await Promise.all([
          apiClient.get(`/teams/myTeams/${teamId}`),
          apiClient.get(`/polls/teamPoll/${teamId}`),
        ]);

        const fetchedPolls = pollsRes.data || [];
        setTeamData(teamRes.data?.team || null);
        setPolls(fetchedPolls);
        setActivePoll(fetchedPolls[0] || null);
      } catch (error) {
        console.error("Error fetching polls page data:", error);
      }
    };
    if (teamId) fetchPageData();
  }, [teamId]);

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

  const handleCreatePoll = async (payload) => {
    try {
      if (!teamId) return false;
      setIsCreatingPoll(true);

      const { data: createdPoll } = await apiClient.post(`/polls/createPoll/${teamId}`, payload);
      setPolls((prev) => [createdPoll, ...prev]);
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
          <CardTitle className="text-center text-base tracking-widest uppercase">
            Team {teamData?.teamName || "Loading..."}
          </CardTitle>
        </CardHeader>
      </Card>

      <Polldialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreatePoll={handleCreatePoll}
        isSubmitting={isCreatingPoll}
        teamName={teamData?.teamName}
      />

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
