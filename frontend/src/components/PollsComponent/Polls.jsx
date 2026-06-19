const PollsContainer = ({ polls = [], activePollId, onSelectPoll }) => {
  const selectedId = activePollId;

  return (
    <div className="w-full">
      <div className="overflow-y-auto space-y-2">
        {polls.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No polls found</div>
        ) : (
          polls.map((p) => (
            <button
              key={p._id}
              onClick={() => onSelectPoll?.(p)}
              className={`w-full rounded-md border px-4 py-3 text-left hover:bg-muted/50 ${
                String(p._id) === String(selectedId) ? 'ring-2 ring-offset-1' : ''
              }`}
            >
              <div className="font-medium">{p.question}</div>
              <div className="text-xs text-muted-foreground">{p.options?.length || 0} options</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PollsContainer;
