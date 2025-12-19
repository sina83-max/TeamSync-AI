"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function RandomizeTeamsButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            variant="outline"
            disabled={pending}
            className="border-indigo-500/60 bg-zinc-950/60 text-xs font-semibold text-indigo-200 hover:bg-zinc-900 hover:text-indigo-100 disabled:opacity-50"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Randomizing...
                </>
            ) : (
                "Randomize teams"
            )}
        </Button>
    );
}
