import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const Pollsarea = ({ activePoll, onVote }) => {
  const [minutesLeft, setMinutesLeft] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [lastTotalVotes, setLastTotalVotes] = useState(0);
  const options = activePoll?.options || [];
  const maxVotes = options.reduce((max, option) => Math.max(max, option?.votes || 0), 0);
  const totalVotes = useMemo(
    () => options.reduce((sum, option) => sum + (option?.votes || 0), 0),
    [options]
  );
  const barColors = [
    "bg-yellow-500/80",
    "bg-emerald-500/80",
    "bg-sky-500/80",
    "bg-amber-500/80",
    "bg-rose-500/80",
    "bg-pink-500/80",
  ];

  const getMinutesLeft = (poll) => {
    if (!poll?.expiresAt) return null;
    const diff = new Date(poll.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 60000));
  };

  useEffect(() => {
    if (!activePoll?.expiresAt) {
      setMinutesLeft(null);
      return;
    }

    setMinutesLeft(getMinutesLeft(activePoll));
    const timer = setInterval(() => {
      setMinutesLeft(getMinutesLeft(activePoll));
    }, 60000);

    return () => clearInterval(timer);
  }, [activePoll?._id, activePoll?.expiresAt]);

  const isEnded = useMemo(() => minutesLeft === 0, [minutesLeft]);

  useEffect(() => {
    if (!activePoll) {
      setLastUpdatedAt(null);
      setLastTotalVotes(0);
      return;
    }

    setLastUpdatedAt(null);
    setLastTotalVotes(totalVotes);
  }, [activePoll?._id]);

  useEffect(() => {
    if (!activePoll) return;
    if (totalVotes !== lastTotalVotes) {
      setLastUpdatedAt(new Date());
      setLastTotalVotes(totalVotes);
    }
  }, [activePoll?._id, totalVotes, lastTotalVotes]);

  if (!activePoll) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">No Active Poll</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="">
        <CardTitle className="text-center text-base text-muted-foreground">
          {isEnded
            ? "Poll has ended"
            : minutesLeft !== null
              ? `Poll will end in ${minutesLeft} minutes`
              : `Poll will end in ${activePoll.durationMinutes} minutes`}
        </CardTitle>
        <CardTitle className="text-center text-2xl">{activePoll.question}</CardTitle>
        {lastUpdatedAt && (
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="space-y-3 pt-6">
            {options.map((option, index) => {
              const votes = option?.votes || 0;
              const width = maxVotes ? (votes / maxVotes) * 100 : 0;
              const barColor = barColors[index % barColors.length];

              return (
                <div
                  key={option?._id || index}
                  className="group grid grid-cols-[120px_1fr] items-center gap-3"
                >
                  <span className="truncate text-sm text-muted-foreground/90">
                    {option?.text || `Option ${index + 1}`}
                  </span>
                  <div className="relative h-8">
                    <div
                      className={`h-full rounded-sm ${barColor} transition-all`}
                      style={{ width: `${width}%` }}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {votes}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option, index) => (
            <Button
              key={option?._id || index}
              type="button"
              variant={
                String(option?._id) === String(activePoll?.selectedOptionId)
                  ? "secondary"
                  : "outline"
              }
              className="w-full justify-center py-2.5"
              onClick={() => onVote?.(option?._id)}
              disabled={isEnded}
            >
              {option?.text || `Option ${index + 1}`}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Pollsarea;
