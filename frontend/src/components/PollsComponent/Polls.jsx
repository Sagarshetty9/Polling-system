import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const Polls = ({ polls = [], activePollId, onSelectPoll }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground text-center uppercase tracking-widest">
          Polls
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {polls.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">No polls yet</p>
        ) : (
          polls.map((poll, index) => (
            <Badge
              key={poll._id || index}
              variant={poll._id === activePollId ? "default" : "outline"}
              className="w-full cursor-pointer justify-center py-2.5 text-sm font-normal rounded-md"
              onClick={() => onSelectPoll?.(poll)}
            >
              {poll.question || `Poll ${index + 1}`}
            </Badge>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Polls;
