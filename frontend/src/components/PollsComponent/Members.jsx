import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const Members = ({ members }) => {
  // Always good to keep this during dev to see if members are populated or just IDs
  console.log("Members Component members:", members);

  const memberList = members || [];

  return (
    <Card className="h-full">
      <CardHeader>
        
        <CardTitle className="text-sm font-medium text-muted-foreground text-center uppercase tracking-widest">
          Members
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {memberList.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">
            No members found
          </p>
        ) : (
          memberList.map((member) => (
            <Badge 
              key={member?._id || member} 
              variant="secondary" 
              className="w-full justify-center py-2.5 text-sm font-normal rounded-md"
            >
              
              {member?.username || member?.name || member?.toString()?.slice(-4)}
            </Badge>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default Members;
