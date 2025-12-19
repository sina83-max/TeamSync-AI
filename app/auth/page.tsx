import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthPanel } from "@/components/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-10">
      <Card className="w-full border-zinc-800/80 bg-zinc-950/80 shadow-[0_0_40px_rgba(37,99,235,0.5)]">
        <CardHeader>
          <CardTitle className="text-center text-zinc-50">
            Welcome to TeamSync AI
          </CardTitle>
          <p className="mt-1 text-center text-xs text-zinc-400">
            Sign in or create an account to sync squads and run vibe checks that
            actually mean something.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthPanel />
          <p className="text-center text-[10px] text-zinc-500">
            By continuing, you agree to let our AI judge your projects with a
            professional amount of sass.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}


