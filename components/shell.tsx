"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Compass,
  LayoutGrid,
  Lightbulb,
  PanelRightOpen,
  Radio,
  Users,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Engagement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
export const steps = [
  {
    key: "discovery",
    name: "Brand Discovery",
    short: "Discovery",
    icon: BookOpen,
  },
  {
    key: "audiences",
    name: "Audience Set-up",
    short: "Audiences",
    icon: Users,
  },
  { key: "trends", name: "Trend Tracking", short: "Trends", icon: Radio },
  {
    key: "outputs",
    name: "Creative Outputs",
    short: "Outputs",
    icon: Lightbulb,
  },
];
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#2f5d50] text-[#e2edc9]">
        <Star size={19} strokeWidth={1.3} />
      </span>
      <span className="text-[19px] font-semibold tracking-[-.7px]">
        socialglass<span className="ml-0.5 text-primary">.</span>
      </span>
    </div>
  );
}
export function Shell({
  e,
  children,
}: {
  e?: Engagement;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const module = steps.find((s) => pathname.endsWith("/" + s.key));
  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-[#dfe5d8] bg-[#f0f3eb] px-5 py-7 max-lg:transition-transform",
          mobile ? "translate-x-0" : "max-lg:-translate-x-full",
        )}
      >
        <Link href="/" aria-label="SocialGlass home">
          <Logo />
        </Link>
        <p className="eyebrow mb-9 ml-10 mt-1.5 text-[#7d8978]">Partnerships</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobile(false)}
          className="absolute right-2 top-1 lg:hidden"
          aria-label="Close navigation"
        >
          <X size={16} />
        </Button>
        <Link
          href="/"
          className="mb-7 flex items-center gap-2 text-xs text-[#6e7d70]"
        >
          <ArrowLeft size={14} /> All engagements
        </Link>
        {e ? (
          <>
            <div className="rounded-xl border border-[#d9e1d1] bg-[#fafbf5] p-3.5">
              <div className="mb-2 flex justify-between text-[13px] font-semibold">
                {e.brand.name}
                <ChevronDown size={14} />
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">{e.name}</p>
              <Badge className="border border-[#d7e2cb] bg-transparent">
                {e.scope === "brand" ? "Brand-wide" : "Property-specific"}
              </Badge>
            </div>
            <p className="eyebrow mb-3 mt-8 text-[#879180]">Your workspace</p>
            <nav className="space-y-1">
              <Link
                onClick={() => setMobile(false)}
                href={`/engagements/${e.id}`}
                className={cn(
                  "mb-3 flex items-center gap-3 rounded-lg px-3 py-3 text-[13px]",
                  !module
                    ? "bg-[#dde7cf] font-semibold text-[#2d513e]"
                    : "text-[#6b7a69] hover:bg-[#e5ebdd]",
                )}
              >
                <LayoutGrid size={16} />
                Overview
              </Link>
              {steps.map((s, i) => (
                <Link
                  onClick={() => setMobile(false)}
                  key={s.key}
                  href={`/engagements/${e.id}/${s.key}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3.5 text-[12px]",
                    module?.key === s.key
                      ? "bg-[#dde7cf] font-semibold text-[#2d513e]"
                      : "text-[#6b7a69] hover:bg-[#e5ebdd]",
                  )}
                >
                  <s.icon size={16} />
                  <span className="flex-1">{s.name}</span>
                  <span className="font-mono text-[10px] opacity-50">
                    0{i + 1}
                  </span>
                </Link>
              ))}
            </nav>
          </>
        ) : (
          <>
            <p className="eyebrow mb-4 text-muted-foreground">Your workspace</p>
            <div className="flex items-center gap-3 rounded-lg bg-[#dde7cf] px-3 py-3 text-[13px] font-semibold">
              <LayoutGrid size={16} />
              Engagements
            </div>
          </>
        )}
        <div className="mt-auto pt-10">
          <div className="rounded-lg border border-[#dce4d4] p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-[#7ca075]" />{" "}
              SocialGlass connected
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-[#899480]">
              Demo workspace · Mock intelligence
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full border border-[#d2dccc] bg-[#e5eadc] text-[10px] font-semibold">
              SG
            </div>
            <div>
              <p className="text-xs font-medium">Strategy team</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Consultant workspace
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:ml-[232px]">
        <header className="flex h-[76px] items-center justify-between gap-3 border-b border-border bg-[#fdfefa]/80 px-5 md:px-10">
          <div className="flex items-center gap-3 text-[11px] text-[#85907f]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobile(true)}
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </Button>
            <span className="max-sm:hidden">Partnerships</span>
            <span className="max-sm:hidden">/</span>
            {e ? (
              <>
                <Link href={`/engagements/${e.id}`} className="max-sm:hidden">
                  {e.brand.name}
                </Link>
                <span className="max-sm:hidden">/</span>
                <span className="text-[#3c5140]">
                  {module?.name ?? "Overview"}
                </span>
              </>
            ) : (
              <span className="text-[#3c5140]">Engagements</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-[10px] text-[#85907f] sm:flex">
              <span className="size-1.5 rounded-full bg-[#7da176]" />
              Workspace connected
            </span>
            {e && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PanelRightOpen size={13} />
                    Context
                  </Button>
                </DialogTrigger>
                <DialogContent className="left-auto right-0 top-0 h-dvh max-h-dvh w-full max-w-xl translate-x-0 translate-y-0 rounded-none">
                  <DialogTitle className="display text-3xl">
                    The grounding for every idea.
                  </DialogTitle>
                  <DialogDescription className="mb-8 mt-3 text-sm text-muted-foreground">
                    Discovery brief · {e.brand.name}
                  </DialogDescription>
                  <div className="markdown">
                    <ReactMarkdown>
                      {e.discoveryBrief ||
                        "Complete Brand Discovery to build your shared context."}
                    </ReactMarkdown>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1580px] px-5 py-8 md:px-10 md:py-10 fade-in">
          {children}
        </main>
        <footer className="mx-5 mt-5 flex justify-between border-t border-border py-6 text-[10px] text-[#99a08f] md:mx-10">
          <span>Built on behavior. Made for possibility.</span>
          <span className="flex items-center gap-1">
            Powered by SocialGlass <ArrowUpRight size={11} />
          </span>
        </footer>
      </div>
    </div>
  );
}
