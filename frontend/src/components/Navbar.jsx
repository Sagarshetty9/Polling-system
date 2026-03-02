import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <main className="relative overflow-hidden bg-background p-4 sm:p-8">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />

      <section className="relative mx-auto w-full max-w-7xl">
        <Card className="border-border/80 bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">Dashboard</CardTitle>
              <CardDescription>
                Manage your polls, monitor activity, and track voter engagement.
              </CardDescription>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}