import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

      <section className="relative mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <Card className="w-full max-w-3xl border-border/90 bg-card/90 text-center shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Polling System
            </p>
            <CardTitle className="text-4xl font-bold leading-tight sm:text-5xl">
              Build and manage live polls in minutes
            </CardTitle>
            <CardDescription className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Create questions, collect votes, and see instant results on a
              clean dashboard designed for fast decisions.
            </CardDescription>
          </CardHeader>

          <CardContent className="mx-auto w-full max-w-xl">
            <div className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center gap-3 pb-8 sm:flex-row">
            <Button asChild className="min-w-40">
              <Link to="/register">Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="min-w-40">
              <Link to="/login">Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
};

export default LandingPage;
