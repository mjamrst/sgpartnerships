"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Plus,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  Signal,
} from "lucide-react";
import Link from "next/link";
import {
  platforms,
  type Audience,
  type AudienceDefinition,
  type Engagement,
} from "@/lib/types";
import { compact } from "@/lib/utils";
import { Shell } from "./shell";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Feedback, ModuleHeading, useWorkbench } from "./workbench";
import { Field } from "./discovery-module";
const blank: AudienceDefinition = {
  name: "",
  seedAccounts: [],
  interests: [],
  behaviors: [],
  platforms: ["Instagram", "TikTok"],
  geo: "Los Angeles metro",
  ageBand: "25–40",
  exclusions: ["Under 18", "Gambling", "Crypto promotion"],
};
export function AudiencesModule({ initial }: { initial: Engagement }) {
  const w = useWorkbench(initial);
  const { e, run, busy } = w;
  const [editing, setEditing] = useState<Audience | null>(null);
  const [open, setOpen] = useState(false);
  const [def, setDef] = useState<AudienceDefinition>(blank);
  const [inspect, setInspect] = useState<string | null>(null);
  const [remove, setRemove] = useState<string | null>(null);
  const current = e.audiences.find((a) => a.id === inspect);
  function edit(a?: Audience) {
    setEditing(a ?? null);
    setDef(a ? structuredClone(a.definition) : structuredClone(blank));
    setOpen(true);
  }
  return (
    <Shell e={e}>
      <ModuleHeading
        step="02 / Audience Set-up"
        title="Find your people."
        description="Define the communities behind the opportunity. Build, refine, and connect them to SocialGlass."
      >
        <Button
          variant="outline"
          disabled={!!busy}
          onClick={() => run("recommend-audiences")}
        >
          <Sparkles size={14} />
          Build from brief
        </Button>
        <Button onClick={() => edit()}>
          <Plus size={15} />
          Add audience
        </Button>
      </ModuleHeading>
      <Feedback {...w} />
      <div className="mb-7 flex flex-wrap items-center gap-6 rounded-xl border border-[#d9e3cd] bg-[#edf2e4] px-6 py-5">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#dfe9d2]">
          <Users size={21} strokeWidth={1.3} />
        </div>
        <div>
          <p className="text-xs font-semibold">
            A shared view of your audience
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {e.audiences.length} segments ·{" "}
            {e.audiences.filter((a) => a.status === "live").length} connected to
            mock SocialGlass
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-light">
            {compact(e.audiences.reduce((s, a) => s + a.size, 0))}
          </p>
          <p className="mt-1 text-[9px] text-muted-foreground">
            Combined estimate · includes overlaps
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {e.audiences.map((a, i) => (
          <article key={a.id} className="paper flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e1e7d9] bg-[#f0f4e8] px-5 py-4">
              <span className="font-mono text-[10px] text-[#8b9a7b]">
                AUDIENCE {String(i + 1).padStart(2, "0")}
              </span>
              <Badge
                className={a.status === "live" ? "bg-[#e3edda]" : "bg-white"}
              >
                {a.status === "live" ? (
                  <>
                    <span className="size-1.5 rounded-full bg-[#77996b]" />
                    Live · mock
                  </>
                ) : (
                  "Draft"
                )}
              </Badge>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-base font-semibold">{a.name}</h2>
              <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted-foreground">
                {a.definition.interests.join(" · ")}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-light tracking-tight">
                    {a.size ? compact(a.size) : "—"}
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Estimated addressable audience
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Ages {a.definition.ageBand}
                </span>
              </div>
              <p className="mb-4 mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <MapPin size={11} />
                {a.definition.geo}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {a.platforms.map((p) => (
                  <Badge
                    key={p}
                    className="border border-[#e3e8dc] bg-white text-[9px] text-[#7d8b70]"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
              {a.composition.platformMix?.length > 0 && (
                <div className="mt-5">
                  <div className="flex h-1.5 overflow-hidden rounded-full">
                    {a.composition.platformMix.map((p, i) => (
                      <div
                        key={p.name}
                        style={{
                          width: `${p.percentage}%`,
                          background: [
                            "#2f5d50",
                            "#85a579",
                            "#c4d5ae",
                            "#e2e9d5",
                          ][i % 4],
                        }}
                      />
                    ))}
                  </div>
                  <button
                    className="mt-3 flex items-center gap-1 text-[10px] text-primary"
                    onClick={() => setInspect(a.id)}
                  >
                    Audience composition
                    <ArrowUpRight size={11} />
                  </button>
                </div>
              )}
              <div className="mt-auto flex gap-2 border-t border-border pt-4 mt-5">
                <Button size="sm" variant="outline" onClick={() => edit(a)}>
                  <SlidersHorizontal size={12} />
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  variant={a.status === "live" ? "secondary" : "default"}
                  disabled={!!busy}
                  onClick={() => run("push-audience", { audienceId: a.id })}
                >
                  <Send size={12} />
                  {a.status === "live"
                    ? "Refresh estimate"
                    : "Push to SocialGlass"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => setRemove(a.id)}
                  aria-label={`Delete ${a.name}`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!e.audiences.length && (
        <div className="paper p-12 text-center">
          <Users className="mx-auto text-muted-foreground" />
          <h2 className="mt-5 text-lg">Your audiences start with discovery.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build from the recommended segments in your brief, or add a segment
            yourself.
          </p>
        </div>
      )}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          All estimates are illustrative. Audience overlaps are not
          deduplicated.
        </p>
        <Button asChild variant="outline">
          <Link href={`/engagements/${e.id}/trends`}>
            Continue to trends
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="display text-3xl">
            {editing ? "Refine the audience" : "Define an audience"}
          </DialogTitle>
          <DialogDescription className="mb-6 mt-2 text-sm text-muted-foreground">
            Start with behaviors and affinities, then add boundaries.
          </DialogDescription>
          <Feedback {...w} />
          <div className="space-y-4">
            <Field
              label="Audience name"
              value={def.name}
              onChange={(v) => setDef({ ...def, name: v })}
            />
            {(
              [
                ["seedAccounts", "Seed accounts / handles"],
                ["interests", "Interest & affinity keywords"],
                ["behaviors", "Behavioral signals"],
                ["exclusions", "Exclusion rules"],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={`${label} · one per line`}
                area
                value={def[key].join("\n")}
                onChange={(v) => setDef({ ...def, [key]: v.split("\n") })}
              />
            ))}
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Geography"
                value={def.geo}
                onChange={(v) => setDef({ ...def, geo: v })}
              />
              <Field
                label="Age band"
                value={def.ageBand}
                onChange={(v) => setDef({ ...def, ageBand: v })}
              />
            </div>
            <fieldset>
              <legend className="mb-3 text-xs">Platforms</legend>
              <div className="flex flex-wrap gap-3">
                {platforms.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={def.platforms.includes(p)}
                      onChange={(ev) =>
                        setDef({
                          ...def,
                          platforms: ev.target.checked
                            ? [...def.platforms, p]
                            : def.platforms.filter((v) => v !== p),
                        })
                      }
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <Button
              className="mt-4 w-full"
              disabled={!!busy || !def.name.trim() || !def.platforms.length}
              onClick={async () => {
                if (
                  await run("save-audience", {
                    audienceId: editing?.id,
                    definition: def,
                  })
                )
                  setOpen(false);
              }}
            >
              Save audience
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!current} onOpenChange={(v) => !v && setInspect(null)}>
        <DialogContent>
          <DialogTitle className="display text-3xl">
            {current?.name}
          </DialogTitle>
          <DialogDescription className="mb-7 mt-2 text-sm text-muted-foreground">
            Mock composition · estimated {compact(current?.size ?? 0)} people
          </DialogDescription>
          {current && (
            <div className="space-y-7">
              {[
                {
                  title: "Platform mix",
                  items: current.composition.platformMix,
                },
                {
                  title: "Top affinities",
                  items: current.composition.topAffinities,
                },
                {
                  title: "Audience overlap",
                  items: current.composition.overlaps,
                },
              ].map((group) => (
                <section key={group.title}>
                  <h3 className="mb-4 text-xs font-semibold">{group.title}</h3>
                  {group.items.map((item) => (
                    <div key={item.name} className="mb-3">
                      <div className="mb-1.5 flex justify-between text-[11px]">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-[#90aa7f]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!remove} onOpenChange={(v) => !v && setRemove(null)}>
        <DialogContent>
          <DialogTitle className="display text-3xl">
            Remove this audience?
          </DialogTitle>
          <DialogDescription className="my-5 text-sm text-muted-foreground">
            The audience definition will be removed. Existing trend snapshots
            and ideas remain available.
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRemove(null)}>
              Keep audience
            </Button>
            <Button
              variant="destructive"
              disabled={!!busy}
              onClick={async () => {
                if (await run("delete-audience", { audienceId: remove }))
                  setRemove(null);
              }}
            >
              Remove audience
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
