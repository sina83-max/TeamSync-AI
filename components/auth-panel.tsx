"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Mode = "sign-in" | "sign-up";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // If email confirmation is disabled, user gets a session immediately
        if (data.session) {
          setMessage("Account created! Redirecting...");
          setTimeout(() => router.push("/"), 500);
        } else {
          // Email confirmation required - try to sign in anyway (works if disabled)
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            setMessage("Account created. Please check your email to confirm, then sign in.");
          } else {
            setMessage("Account created! Redirecting...");
            setTimeout(() => router.push("/"), 500);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Signed in! Redirecting...");
        // Redirect to home page
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading || !email.trim() || !password.trim() || password.length < 6;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="you@teamsync.ai"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-zinc-700 bg-zinc-950 text-sm text-zinc-50 placeholder:text-zinc-500"
        />
        <Input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-zinc-700 bg-zinc-950 text-sm text-zinc-50 placeholder:text-zinc-500"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="submit"
          disabled={disabled}
          className="flex-1 rounded-full bg-indigo-500 px-4 text-sm font-semibold text-zinc-50 shadow-[0_0_20px_rgba(79,70,229,0.6)] hover:bg-indigo-400 disabled:opacity-60"
        >
          {loading
            ? "Syncing..."
            : mode === "sign-in"
              ? "Sign in"
              : "Sign up"}
        </Button>
        <button
          type="button"
          onClick={() =>
            setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"))
          }
          className="text-xs font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
        >
          {mode === "sign-in" ? "Need an account?" : "Have an account?"}
        </button>
      </div>
      {(error || message) && (
        <p className="text-xs text-zinc-400">
          {error || message}
        </p>
      )}
    </form>
  );
}


