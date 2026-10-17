"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Engagement } from "@/lib/types";
export function useWorkbench(initial: Engagement) {
  const [e, setE] = useState(initial);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => setE(initial), [initial]);
  async function run(action: string, payload: unknown = {}) {
    setBusy(action);
    setNotice("");
    setError("");
    try {
      const response = await fetch(`/api/engagements/${e.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "That action could not be completed.");
      if (data.engagement) setE(data.engagement);
      setNotice(data.notice || "Saved to your workspace.");
      router.refresh();
      return data.engagement as Engagement | undefined;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      return undefined;
    } finally {
      setBusy("");
    }
  }
  return { e, run, busy, notice, error };
}
export type Workbench = ReturnType<typeof useWorkbench>;
export function Feedback({
  busy,
  notice,
  error,
}: Pick<Workbench, "busy" | "notice" | "error">) {
  return (
    <div aria-live="polite">
      {busy && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#d6e2ca] bg-[#f0f5e9] p-3 text-xs text-primary">
          <Loader2 size={14} className="animate-spin" />
          Working on it. Your saved work stays available…
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {notice && !busy && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#d6e2ca] bg-[#f0f5e9] p-3 text-xs text-primary">
          <CheckCircle2 size={14} />
          {notice}
        </div>
      )}
    </div>
  );
}
export function ModuleHeading({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="eyebrow mb-3 text-muted-foreground">{step}</p>
        <h1 className="display text-[42px]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
