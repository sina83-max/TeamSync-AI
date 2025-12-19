import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const MODEL_NAME = "llama-3.1-70b-versatile";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

type QuestionRequest = {
  mode: "questions";
  projectName: string;
  projectDescription: string;
};

type GradeRequest = {
  mode: "grade";
  projectName: string;
  projectDescription: string;
  answers: string[];
};

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: QuestionRequest | GradeRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (body.mode === "questions") {
    return handleQuestions(body);
  }

  if (body.mode === "grade") {
    return handleGrade(body);
  }

  return NextResponse.json(
    { error: "Invalid mode. Use 'questions' or 'grade'." },
    { status: 400 }
  );
}

async function handleQuestions(body: QuestionRequest) {
  const prompt = `
You are an AI product coach. A user is describing a project and wants to run a "vibe check".

Project name: ${body.projectName}
Project description (2 sentences): ${body.projectDescription}

Step 1: Generate exactly 3 sharp, practical questions that would help you evaluate:
- clarity of the problem,
- realism of the scope,
- how well this team is set up to execute.

Constraints:
- Be specific to this project (no generic startup-ism).
- Each question should be a single sentence.
- Respond as pure JSON with the shape: { "questions": [ "q1", "q2", "q3" ] }.
Do not add any extra commentary or keys.
`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: MODEL_NAME,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim() || "";

  try {
    const parsed = JSON.parse(text) as { questions: string[] };
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 3) {
      throw new Error("Model response does not contain exactly 3 questions.");
    }
    return NextResponse.json(
      { questions: parsed.questions },
      { status: 200 }
    );
  } catch {
    // If the model didn't return valid JSON, attempt a simple fallback parse.
    const lines = text
      .replace(/[\[\]"]/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json(
      { questions: lines },
      { status: 200 }
    );
  }
}

async function handleGrade(body: GradeRequest) {
  const answersJoined = body.answers
    .map((a, i) => `Q${i + 1} answer: ${a}`)
    .join("\n");

  const prompt = `
You are an AI "vibe judge" for team projects. Your tone is professional but witty: think sharp product lead with a sense of humor, not a meme account.

Project name: ${body.projectName}
Project description: ${body.projectDescription}

Team's answers:
${answersJoined}

Step 2: Evaluate the project and team readiness.

Output requirements:
- Provide a score from 0 to 100 (higher is better).
- Provide a one-paragraph verdict that is specific, constructive, and lightly witty.

Respond as pure JSON with this exact shape:
{
  "score": 0-100 number,
  "verdict": "one paragraph of feedback"
}

Do not include any extra keys or commentary.
`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: MODEL_NAME,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content?.trim() || "";

  try {
    const parsed = JSON.parse(text) as { score: number; verdict: string };
    return NextResponse.json(
      {
        score: parsed.score,
        verdict: parsed.verdict,
      },
      { status: 200 }
    );
  } catch {
    // Fallback: try to extract a score-like number and treat the rest as verdict.
    const match = text.match(/(\d{1,3})/);
    const score = match ? Math.min(100, Math.max(0, Number(match[1]))) : 0;
    const verdict = text;

    return NextResponse.json(
      {
        score,
        verdict,
      },
      { status: 200 }
    );
  }
}


