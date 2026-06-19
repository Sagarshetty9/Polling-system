// Example structural implementation for your parent component (e.g., Pollspage.jsx or Pollsarea.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../api/socketContext';
import { apiClient } from '../../api/apiClient';
import Polls from './Polls'; // Your Polls list component
// import PollDetails from './Pollsarea'; // Or whichever shows active items

export const ParentPollContainer = ({ teamId }) => {
  const socket = useSocket();
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);

  // 1. Unified HTTP retrieval method
  const fetchTeamPolls = useCallback(async () => {
    if (!teamId) return;
    try {
      const response = await apiClient.get(`/polls/team/${teamId}`); // Adjust endpoint to match your pollRouter
      setPolls(response.data);
      
      // Keep active poll data structural view updated if one is open
      if (activePoll) {
        const updatedActive = response.data.find(p => p._id === activePoll._id);
        if (updatedActive) setActivePoll(updatedActive);
      }
    } catch (error) {
      console.error("Failed fetching live updates:", error);
    }
  }, [teamId, activePoll]);

  // Initial Data Fetch & Socket Room Subscription
  useEffect(() => {
    fetchTeamPolls();

    if (!socket || !teamId) return;

    // Join the specific room channel for this team
    socket.emit('join_poll_room', teamId.toString());

    // 2. Listen for real-time signaling triggers
    socket.on('poll_voted', (data) => {
      console.log(`⚡ Realtime Update: Vote registered in poll ${data.pollId}`);
      fetchTeamPolls(); // Re-fetch all polls via HTTP to keep data fresh across all components
    });

    // Cleanup when moving to a different channel or unmounting
    return () => {
      socket.off('poll_voted');
    };
  }, [socket, teamId, fetchTeamPolls]);

  return (
    <div className="flex gap-4 h-full">
      {/* Passing the fresh, live array down to your unmodified component */}
      <Polls 
        polls={polls} 
        activePollId={activePoll?._id} 
        onSelectPoll={setActivePoll} 
      />
      
      {/* Visual content/charts details pane would sit here */}
    </div>
  );
};