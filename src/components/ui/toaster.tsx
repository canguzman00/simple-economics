"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { useToastStore } from "@/hooks/use-toast";

export function Toaster() {
  const toasts = useToastStore();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open
          className={`
            flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg
            data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4
            data-[state=closed]:animate-out data-[state=closed]:fade-out-80
            ${t.variant === "destructive"
              ? "bg-[#2C1510] border-[#B84A2A] text-[#FAF9F6]"
              : "bg-[#2C2417] border-[#4A3D2A] text-[#FAF9F6]"
            }
          `}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <ToastPrimitive.Title className="font-sans text-sm font-medium">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="font-sans text-xs text-[#7A6A52]">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="shrink-0 text-[#7A6A52] hover:text-[#C8B8A2] transition-colors mt-0.5">
            <X size={14} />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]" />
    </ToastPrimitive.Provider>
  );
}
