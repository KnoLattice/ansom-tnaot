import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionCTAProps {
  onStart: () => void;
  disabled?: boolean;
}

export function SessionCTA({ onStart, disabled }: SessionCTAProps) {
  return (
    <div className="kl-glass-panel pointer-events-auto flex w-64 flex-col gap-3 rounded-3xl p-5 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
          <Rocket className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Start adaptive session</p>
          <p className="text-xs text-white/60">Focus on the next unlock</p>
        </div>
      </div>
      <Button disabled={disabled} onClick={onStart} className="bg-[var(--color-accent-primary)] text-white">
        Launch session
      </Button>
    </div>
  );
}
