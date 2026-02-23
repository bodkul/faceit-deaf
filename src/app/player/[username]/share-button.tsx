"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [isCopied, setIsCopied] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setIsCopied(true);

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1800);
    } catch {
      setIsCopied(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleCopy} variant="outline">
          <IconCopy className="size-4" />
          {"\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f"}
        </Button>
      </div>

      {isCopied && (
        <div className="fixed right-4 bottom-4 z-50 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-emerald-200 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <IconCheck className="size-4" />
            {
              "\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043e!"
            }
          </div>
        </div>
      )}
    </>
  );
}
