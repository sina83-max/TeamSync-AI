"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Phase = "describe" | "answer" | "result";

type QuestionsResponse = {
  questions: string[];
};

type GradeResponse = {
  score: number;
  verdict: string;
};

export function VibeCheckPanel() {
  const [phase, setPhase] = useState<Phase>("describe");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResponse | null>(null);

  async function handleGenerateQuestions() {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/vibe-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "questions",
          projectName,
          projectDescription,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate questions.");
      }

      const data = (await res.json()) as QuestionsResponse;
      setQuestions(data.questions ?? []);
      setAnswers(["", "", ""]);
      setPhase("answer");
    } catch (err: any) {
      setError(err.message || "Something went wrong talking to the AI judge.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/vibe-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "grade",
          projectName,
          projectDescription,
          answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to grade answers.");
      }

      const data = (await res.json()) as GradeResponse;
      setResult(data);
      setPhase("result");
    } catch (err: any) {
      setError(
        err.message ||
          "The AI judge tripped over its own cleverness. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading ||
    !projectName.trim() ||
    !projectDescription.trim() ||
    (phase === "answer" && answers.some((a) => !a.trim()));

  return (
    <div className="space-y-4 text-sm text-zinc-400">
      {phase === "describe" && (
        <>
          <p>
            Drop in your project name and a crisp two-sentence description.
            We&apos;ll spin up three laser-focused questions to probe the vibe.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Project name
              </label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. StandupSync, Async Standups for Remote Teams"
                className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Project description (2 sentences)
              </label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
                placeholder="What problem are you solving, and why does this team have an unfair advantage?"
                className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
              />
            </div>
          </div>
        </>
      )}

      {phase === "answer" && (
        <>
          <p className="text-zinc-300">
            Nice. Answer these three questions like you would in a tight product
            review. The judge is paying attention.
          </p>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs font-medium text-indigo-200">
                  Q{idx + 1}. {q}
                </p>
                <Textarea
                  value={answers[idx] ?? ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[idx] = e.target.value;
                    setAnswers(next);
                  }}
                  rows={3}
                  className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
        </>
      )}

      {phase === "result" && result && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Vibe check result
            </p>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/70 shadow-[0_0_22px_rgba(129,140,248,0.85)]">
              Score: {Math.round(result.score)} / 100
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">
            {result.verdict}
          </p>
          <p className="text-xs text-zinc-500">
            Not thrilled with the verdict? Iterate on the description with your
            team and run the vibe check again. The judge never sleeps.
          </p>
        </>
      )}

      {error && (
        <p className="text-xs font-medium text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        {phase === "describe" && (
          <Button
            onClick={handleGenerateQuestions}
            disabled={disabled}
            className="w-full bg-indigo-500 text-zinc-50 shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? "Summoning questions..." : "Generate questions"}
          </Button>
        )}
        {phase === "answer" && (
          <Button
            onClick={handleGrade}
            disabled={disabled}
            className="w-full bg-indigo-500 text-zinc-50 shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? "Judging vibes..." : "Run vibe check"}
          </Button>
        )}
        {phase === "result" && (
          <Button
            variant="outline"
            onClick={() => {
              setPhase("describe");
              setResult(null);
              setQuestions([]);
              setAnswers(["", "", ""]);
            }}
            className="border-zinc-700 bg-zinc-950/60 text-zinc-200 hover:bg-zinc-900"
          >
            Run another check
          </Button>
        )}
      </div>
    </div>
  );
}


