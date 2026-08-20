"use client";

import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger
          type="button"
          aria-label="Más información"
          className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Info className="size-4" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-50 max-w-64 animate-in rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-xl fade-in zoom-in-95"
          >
            {children}
            <Tooltip.Arrow className="fill-foreground" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
