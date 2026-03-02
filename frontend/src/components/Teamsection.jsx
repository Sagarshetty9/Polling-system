import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link } from "react-router-dom";

import apiClient from "../api/apiClient";

const gradientCards = [
  "from-primary/25 via-primary/10 to-transparent",
  "from-emerald-500/20 via-emerald-500/10 to-transparent",
  "from-sky-500/20 via-sky-500/10 to-transparent",
  "from-amber-500/20 via-amber-500/10 to-transparent",
];

export default function TeamSection() {
  const [createTeamName, setCreateTeamName] = useState("");
  const [joinTeamName, setJoinTeamName] = useState("");
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const joinedCountLabel = useMemo(() => {
    if (joinedTeams.length === 0) return "No teams joined yet";
    if (joinedTeams.length === 1) return "1 team joined";
    return `${joinedTeams.length} teams joined`;
  }, [joinedTeams.length]);

  const fetchMyTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get("/teams/myTeams");
      setJoinedTeams(data?.teams || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTeams();
  }, [fetchMyTeams]);

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    const nextTeam = createTeamName.trim();

    if (!nextTeam) {
      toast.error("Enter a team name to create");
      return;
    }

    try {
      const { data } = await apiClient.post("/teams/createTeam", { teamName: nextTeam });
      const createdTeam = data?.team;
      if (createdTeam) {
        setJoinedTeams((current) => [createdTeam, ...current]);
      }
      setCreateTeamName("");
      toast.success(data?.message || `Created ${nextTeam}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleJoinTeam = async (event) => {
    event.preventDefault();
    const nextTeam = joinTeamName.trim();

    if (!nextTeam) {
      toast.error("Enter a team name to join");
      return;
    }

    try {
      const { data } = await apiClient.post("/teams/joinTeam", { teamName: nextTeam });
      const joinedTeam = data?.team;

      if (joinedTeam) {
        setJoinedTeams((current) => {
          const withoutTeam = current.filter((team) => team._id !== joinedTeam._id);
          return [joinedTeam, ...withoutTeam];
        });
      }

      setJoinTeamName("");
      toast.success(data?.message || `Joined ${nextTeam}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join team");
    }
  };

  const handleLeaveTeam = async (team) => {
    try {
      await apiClient.delete(`/teams/${team._id}/leave`);
      setJoinedTeams((current) => current.filter((item) => item._id !== team._id));
      toast.success(`Left ${team.teamName}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave team");
    }
  };

  return (
    <main className="px-4 pb-8 sm:px-8 sm:pb-10">
      <section className="relative mx-auto w-full max-w-7xl space-y-6">
        <Card className="relative overflow-hidden border-border/80 shadow-lg backdrop-blur-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <CardHeader>
            <CardTitle className="text-2xl">Team Hub</CardTitle>
            <CardDescription>
              Create your own team or join an existing one to collaborate on polls.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <form
              onSubmit={handleCreateTeam}
              className="space-y-3 rounded-xl border border-border/70 p-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <Label htmlFor="create-team">Create a new team</Label>
                <Input
                  id="create-team"
                  placeholder="Ex: Product Ninjas"
                  value={createTeamName}
                  onChange={(event) => setCreateTeamName(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Team
              </Button>
            </form>

            <form
              onSubmit={handleJoinTeam}
              className="space-y-3 rounded-xl border border-border/70 p-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <Label htmlFor="join-team">Join with team name</Label>
                <Input
                  id="join-team"
                  placeholder="Ex: Growth Squad"
                  value={joinTeamName}
                  onChange={(event) => setJoinTeamName(event.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full">
                Join Team
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-lg backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Joined Teams</CardTitle>
              <CardDescription>{joinedCountLabel}</CardDescription>
            </div>
            <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active
            </span>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                Loading teams...
              </div>
            ) : joinedTeams.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                You have not joined any teams yet. Create or join one to get started.
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {joinedTeams.map((team, index) => (
                  <li
                    key={team._id}
                    className="relative overflow-hidden rounded-xl border border-border/70 p-4 shadow-sm"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientCards[index % gradientCards.length]}`}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <Link
                          to={`/polls/${team._id}`}
                          className="font-semibold transition-colors hover:text-primary hover:underline"
                        >
                          {team.teamName}
                        </Link>
                        <p className="text-xs text-muted-foreground">Collaborative polling team</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleLeaveTeam(team);
                        }}
                      >
                        Leave
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
