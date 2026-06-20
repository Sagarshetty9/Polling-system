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

  // =========================
  // FETCH POLLS
  // =========================
  const fetchTeamPolls = useCallback(
    async ({ selectLatest = false } = {}) => {
      if (!teamId) return [];

      try {
        const { data } = await apiClient.get(
          `/polls/teamPoll/${teamId}`
        );

        const fetchedPolls = data || [];

        setPolls(fetchedPolls);

        setActivePoll((current) => {
          if (!fetchedPolls.length) return null;

          if (selectLatest) return fetchedPolls[0];

          const updated = fetchedPolls.find(
            (p) => p._id === current?._id
          );

          return updated || fetchedPolls[0];
        });

        return fetchedPolls;
      } catch (err) {
        console.error("Fetch polls error:", err);
      }
    },
    [teamId]
  );

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (!teamId) return;

    const load = async () => {
      try {
        const [teamRes] = await Promise.all([
          apiClient.get(`/teams/myTeams/${teamId}`),
          fetchTeamPolls({ selectLatest: true }),
        ]);

        setTeamData(teamRes.data?.team || null);
      } catch (err) {
        console.error("Page load error:", err);
      }
    };

    load();
  }, [teamId, fetchTeamPolls]);

  // =========================
  // SOCKET REAL-TIME LAYER
  // =========================
  useEffect(() => {
    if (!socket || !teamId) return;

    console.log("🔌 Joining team room:", teamId);

    // ✅ MUST MATCH BACKEND: join_team
    socket.emit("join_team", teamId.toString());

    socket.on("connect", () => {
      console.log("🟢 socket connected:", socket.id);
    });

    socket.on("poll_created", (data) => {
      console.log("📦 poll_created:", data);
      fetchTeamPolls({ selectLatest: true });
    });

    socket.on("poll_voted", (data) => {
      console.log("📊 poll_voted:", data);
      fetchTeamPolls();
    });

    socket.on("connect_error", (err) => {
      console.log("🔴 socket error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("poll_created");
      socket.off("poll_voted");
      socket.off("connect_error");
    };
  }, [socket, teamId, fetchTeamPolls]);

  // =========================
  // VOTE
  // =========================
  const handleVote = async (optionId) => {
    try {
      if (!activePoll?._id) return;

      const { data: updatedPoll } = await apiClient.patch(
        `/polls/${activePoll._id}/vote`,
        { optionId }
      );

      setPolls((prev) =>
        prev.map((p) =>
          p._id === updatedPoll._id ? updatedPoll : p
        )
      );

      setActivePoll(updatedPoll);
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  // =========================
  // CREATE POLL
  // =========================
  const handleCreatePoll = async (payload) => {
    try {
      setIsCreatingPoll(true);

      const { data } = await apiClient.post(
        `/polls/createPoll/${teamId}`,
        payload
      );

      setPolls((prev) => [data, ...prev]);
      setActivePoll(data);

      setDialogOpen(false);
      toast.success("Poll created");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create poll");
      return false;
    } finally {
      setIsCreatingPoll(false);
    }
  };

  // =========================
  // DELETE POLL
  // =========================
  const handleDeletePoll = async () => {
    try {
      if (!activePoll?._id) return;

      setIsDeletingPoll(true);

      await apiClient.delete(`/polls/${activePoll._id}`);

      setPolls((prev) => {
        const remaining = prev.filter(
          (p) => p._id !== activePoll._id
        );

        setActivePoll(remaining[0] || null);
        return remaining;
      });

      toast.success("Poll deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Delete failed"
      );
    } finally {
      setIsDeletingPoll(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">

      {/* HEADER */}
      <Card className="border shadow-sm">
        <CardHeader className="relative py-5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute left-4 top-1/2 -translate-y-1/2"
            onClick={() => setDialogOpen(true)}
          >
            <IoMenu className="size-5" />
          </Button>

          {activePoll?._id && (
            <Button
              variant="destructive"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={handleDeletePoll}
              disabled={isDeletingPoll}
            >
              {isDeletingPoll ? "Deleting..." : "Delete Poll"}
            </Button>
          )}

          <CardTitle className="text-center uppercase tracking-widest flex items-center justify-center gap-2">
            Team {teamData?.teamName || "Loading..."}

            <span
              className={`size-2 rounded-full ${
                socket ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* MODAL */}
      <Polldialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreatePoll={handleCreatePoll}
        isSubmitting={isCreatingPoll}
        teamName={teamData?.teamName}
      />

      {/* GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <Members members={teamData?.members || []} />
        </aside>

        <main className="lg:col-span-6">
          <Pollsarea
            activePoll={activePoll}
            onVote={handleVote}
          />
        </main>

        <aside className="lg:col-span-3">
          <Polls
            polls={polls}
            activePollId={activePoll?._id}
            onSelectPoll={setActivePoll}
          />
        </aside>
      </div>
    </div>
  );
};

export default Pollspage;