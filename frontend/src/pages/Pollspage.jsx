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
  const [socketConnected, setSocketConnected] = useState(socket ? socket.connected : false);

  const sameTeam = useCallback((payload = {}) => (
    !payload.teamId || payload.teamId.toString() === teamId?.toString()
  ), [teamId]);

  const mergeLivePoll = useCallback((livePoll, { selectPoll = false } = {}) => {
    if (!livePoll?._id) return;

    setPolls((prevPolls) => {
      const existingPoll = prevPolls.find((poll) => poll._id === livePoll._id);
      const nextPoll = existingPoll
        ? { ...existingPoll, ...livePoll }
        : livePoll;

      if (!existingPoll) return [nextPoll, ...prevPolls];

      return prevPolls.map((poll) => (
        poll._id === nextPoll._id ? nextPoll : poll
      ));
    });

    setActivePoll((currentActivePoll) => {
      if (selectPoll) return livePoll;
      if (currentActivePoll?._id !== livePoll._id) return currentActivePoll;

      return {
        ...currentActivePoll,
        ...livePoll,
        selectedOptionId: currentActivePoll.selectedOptionId,
      };
    });
  }, []);

  const fetchTeamPolls = useCallback(async ({ selectLatest = false } = {}) => {
    if (!teamId) return [];

    const { data } = await apiClient.get(`/polls/teamPoll/${teamId}`);
    const fetchedPolls = data || [];

    setPolls(fetchedPolls);
    setActivePoll((currentActivePoll) => {
      if (!fetchedPolls.length) return null;
      if (selectLatest) return fetchedPolls[0];

      const updatedActivePoll = fetchedPolls.find(
        (poll) => poll._id === currentActivePoll?._id
      );
      return updatedActivePoll || fetchedPolls[0];
    });

    return fetchedPolls;
  }, [teamId]);

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

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setSocketConnected(true);
      console.log('[SOCKET_DEBUG] Socket connect event received in Pollspage');
    };
    const onDisconnect = () => {
      setSocketConnected(false);
      console.log('[SOCKET_DEBUG] Socket disconnect event received in Pollspage');
    };

    setSocketConnected(socket.connected);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!teamId || !socket) {
      console.log('[SOCKET_DEBUG] Pollspage: Missing teamId or socket instance', { teamId, socket: !!socket });
      return;
    }

    const roomId = teamId.toString();
    const joinTeamRoom = () => {
      console.log(`[SOCKET_DEBUG] Emitting join_poll_room for room: ${roomId}`);
      socket.emit("join_poll_room", roomId);
    };
    const handlePollCreated = (payload = {}) => {
      console.log('[SOCKET_DEBUG] Received poll_created event, payload:', payload);
      if (!sameTeam(payload)) {
        console.log('[SOCKET_DEBUG] Event discarded: different team', { payloadTeamId: payload.teamId, activeTeamId: teamId });
        return;
      }
      if (payload.poll) {
        console.log('[SOCKET_DEBUG] Merging live poll from poll_created:', payload.poll);
        mergeLivePoll(payload.poll, { selectPoll: true });
        return;
      }
      console.log('[SOCKET_DEBUG] Fetching team polls (selectLatest: true) as backup...');
      fetchTeamPolls({ selectLatest: true });
    };
    const handlePollVoted = (payload = {}) => {
      console.log('[SOCKET_DEBUG] Received poll_voted event, payload:', payload);
      if (!sameTeam(payload)) {
        console.log('[SOCKET_DEBUG] Event discarded: different team', { payloadTeamId: payload.teamId, activeTeamId: teamId });
        return;
      }
      if (payload.poll) {
        console.log('[SOCKET_DEBUG] Merging live poll from poll_voted:', payload.poll);
        mergeLivePoll(payload.poll);
        return;
      }
      console.log('[SOCKET_DEBUG] Fetching team polls as backup...');
      fetchTeamPolls();
    };

    joinTeamRoom();
    socket.on("connect", joinTeamRoom);
    socket.on("poll_created", handlePollCreated);
    socket.on("poll_voted", handlePollVoted);

    return () => {
      console.log('[SOCKET_DEBUG] Cleaning up Pollspage socket listeners...');
      socket.off("connect", joinTeamRoom);
      socket.off("poll_created", handlePollCreated);
      socket.off("poll_voted", handlePollVoted);
    };
  }, [teamId, socket, fetchTeamPolls, mergeLivePoll, sameTeam]);

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
          <CardTitle className="text-center text-base tracking-widest uppercase flex items-center justify-center gap-2">
            <span>Team {teamData?.teamName || "Loading..."}</span>
            <span 
              className={`inline-block size-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} 
              title={socketConnected ? 'Real-time connected' : 'Real-time disconnected'} 
            />
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
