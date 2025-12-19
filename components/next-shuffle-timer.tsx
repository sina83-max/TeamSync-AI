"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";

export function NextShuffleTimer() {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Next shuffle is the 1st of the next month
            const nextShuffle = new Date(currentYear, currentMonth + 1, 1);
            const diff = nextShuffle.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Due now");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <Card className="border-zinc-800/50 bg-zinc-950/30">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400">
                    <Timer className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Next Team Shuffle
                    </p>
                    <p className="text-sm font-semibold text-zinc-200 font-mono">
                        {timeLeft || "Calculating..."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
