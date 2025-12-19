import { NextResponse } from "next/server";
import { randomizeTeams } from "@/app/actions/randomize-teams";

export async function GET(req: Request) {
    // Verify a secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await randomizeTeams();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
