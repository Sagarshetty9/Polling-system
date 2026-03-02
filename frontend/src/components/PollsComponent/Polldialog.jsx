import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";

const defaultOptions = ["", "", "", ""];

const Polldialog = ({ open, onOpenChange, onCreatePoll, isSubmitting, teamName }) => {
  const [question, setQuestion] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [options, setOptions] = useState(defaultOptions);

  const canSubmit = useMemo(() => {
    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    return question.trim().length > 0 && cleanOptions.length >= 2 && Number(durationMinutes) >= 1;
  }, [question, options, durationMinutes]);

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || !onCreatePoll) return;

    const payload = {
      question: question.trim(),
      options: options.map((opt) => opt.trim()).filter(Boolean),
      durationMinutes: Number(durationMinutes),
    };

    const created = await onCreatePoll(payload);
    if (created) {
      setQuestion("");
      setDurationMinutes("60");
      setOptions(defaultOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="border sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center tracking-wide uppercase">
            {teamName ? `${teamName} Poll` : "Create Poll"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg rounded-md border p-6">
          <div className="space-y-4">
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Topic of the poll..."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((option, index) => (
                <Input
                  key={`option-${index}`}
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start sm:w-auto"
              onClick={handleAddOption}
            >
              + Add option
            </Button>

            <div className="flex items-center gap-3">
              <Label htmlFor="poll-duration" className="whitespace-nowrap text-sm text-muted-foreground">
                Duration of poll
              </Label>
              <Input
                id="poll-duration"
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Polldialog;
