"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserProfileProps = {
  email: string;
  fullName?: string | null;
};

export function UserProfile({ email, fullName }: UserProfileProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/auth");
      router.refresh();
    }
  }

  const displayName = fullName || email.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-indigo-500/60 bg-zinc-950/60 text-xs font-semibold text-indigo-200 hover:bg-zinc-900 hover:text-indigo-100"
        >
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-zinc-800 bg-zinc-950 text-zinc-50"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-zinc-400">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-zinc-200 focus:bg-zinc-900 focus:text-zinc-50"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

