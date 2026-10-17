"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Expand,
  FileJson,
  ImageIcon,
  Lightbulb,
  MapPin,
  Maximize2,
  Minimize2,
  Pencil,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import type { Engagement, Idea, Lane, Scope, Score } from "@/lib/types";
import { laneLabels } from "@/lib/types";
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
import { BriefEditor } from "./brief-editor";
export function OutputsModule({ initial }: { initial: Engagement }) {
  const w = useWorkbench(initial);
  const { e, run, busy } = w;
  const [lane, setLane] = useState<Lane>("experiential");
  const [scope, setScope] = useState<Scope>(initial.scope);
  const [property, setProperty] = useState(
    initial.propertyId ?? initial.brand.properties[0]?.id ?? "",
  );
  const allTrends = e.snapshots.flatMap((s) => s.trends);
  const starred = allTrends.filter((t) => t.starred);
  const [selected, setSelected] = useState(starred.map((t) => t.id));
  const [choose, setChoose] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [edit, setEdit] = useState<Idea | null>(null);
  const [editError, setEditError] = useState("");
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");
  const ideas = e.outputs.filter(
    (o) =>
      o.scope === scope && (scope === "brand" || o.propertyId === property),
  );
  const visible = ideas.filter((o) => o.lane === lane);
  const active = e.outputs.find((i) => i.id === detail);
  const locked = !!busy || rendering;
  async function generate() {
    setRendering(true);
    try {
      const updated = await run("generate-ideas", {
        scope,
        propertyId: scope === "property" ? property : null,
        trendIds: selected.filter((id) => starred.some((t) => t.id === id)),
      });
      if (updated) {
        const fresh = updated.outputs.filter(
          (i) =>
            i.lane === "experiential" && !e.outputs.some((o) => o.id === i.id),
        );
        for (const idea of fresh)
          await run("render", { outputId: idea.id, automatic: true });
      }
    } finally {
      setRendering(false);
    }
  }
  async function exportDeck(format: "html" | "json") {
    setExporting(format);
    setExportError("");
    setExportSuccess("");
    try {
      const res = await fetch(
        `/api/engagements/${e.id}/export?format=${format}&scope=${scope}&propertyId=${encodeURIComponent(property)}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw Error(data.error || "Unable to build export");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sg-partnerships-${scope}.${format}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setExportSuccess(
        format === "html"
          ? "Client deck downloaded. Open the standalone HTML to present it or print to PDF."
          : "JSON export downloaded.",
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Unable to export");
    } finally {
      setExporting("");
    }
  }
  return (
    <Shell e={e}>
      <ModuleHeading
        step="04 / Creative Outputs"
        title="Make the signal mean something."
        description="Specific ideas. A clear reason to exist. Turn your strongest audience signals into partnership possibilities."
      >
        <Button
          variant="outline"
          disabled={!!exporting || locked}
          onClick={() => exportDeck("html")}
        >
          <ArrowDownToLine size={14} />
          {exporting === "html" ? "Building deck…" : "Build Client Deck"}
        </Button>
        <Button
          disabled={
            locked || !selected.some((id) => starred.some((t) => t.id === id))
          }
          onClick={generate}
        >
          <Sparkles size={14} />
          {rendering ? "Creating concepts…" : "Generate Ideas"}
        </Button>
      </ModuleHeading>
      <Feedback {...w} />
      {exportError && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-xs text-red-700"
        >
          {exportError}
        </p>
      )}
      {exportSuccess && (
        <p
          role="status"
          className="mb-5 rounded-lg bg-muted p-3 text-xs text-primary"
        >
          {exportSuccess}
        </p>
      )}
      <div className="mb-7 flex flex-wrap items-center gap-4 rounded-xl border border-[#d9e3cd] bg-[#eff3e6] p-4">
        <span className="eyebrow text-[#8b987c]">Creative scope</span>
        <div className="flex rounded-lg border border-[#dce5d3] bg-white p-1">
          <button
            onClick={() => setScope("brand")}
            className={`rounded-md px-3 py-2 text-[11px] ${scope === "brand" ? "bg-[#2f5d50] text-white" : "text-muted-foreground"}`}
          >
            Brand-wide
          </button>
          <button
            onClick={() => setScope("property")}
            className={`rounded-md px-3 py-2 text-[11px] ${scope === "property" ? "bg-[#2f5d50] text-white" : "text-muted-foreground"}`}
          >
            Property-specific
          </button>
        </div>
        {scope === "property" && (
          <select
            aria-label="Output property"
            className="w-auto max-w-full border-[#dce5d3] py-2 text-[11px]"
            value={property}
            onChange={(ev) => setProperty(ev.target.value)}
          >
            {e.brand.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setChoose(true)}
          className="ml-auto flex items-center gap-2 text-[11px] text-primary"
        >
          <Star size={13} />
          {
            selected.filter((id) => starred.some((t) => t.id === id)).length
          }{" "}
          selected signals
          <SlidersHorizontal size={13} />
        </button>
      </div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border">
        <div className="flex flex-wrap gap-6">
          {(["athlete_creator", "experiential", "social"] as Lane[]).map(
            (l) => (
              <button
                key={l}
                onClick={() => setLane(l)}
                className={`flex items-center gap-2 border-b-2 pb-4 text-xs ${lane === l ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground"}`}
              >
                {l === "athlete_creator" ? (
                  <Users size={14} />
                ) : l === "experiential" ? (
                  <ImageIcon size={14} />
                ) : (
                  <Video size={14} />
                )}{" "}
                {laneLabels[l]}
                <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px]">
                  {ideas.filter((i) => i.lane === l).length}
                </span>
              </button>
            ),
          )}
        </div>
        <button
          className="mb-4 flex items-center gap-1.5 text-[10px] text-muted-foreground"
          disabled={!!exporting}
          onClick={() => exportDeck("json")}
        >
          <FileJson size={12} />
          Export JSON
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {visible.map((idea, i) => {
          const image = idea.renderings.find((r) => r.imageUrl);
          const average =
            Object.values(idea.score).reduce((s, n) => s + n, 0) / 4;
          return (
            <article className="paper overflow-hidden" key={idea.id}>
              {lane === "experiential" ? (
                <div className="relative aspect-video overflow-hidden bg-[#e9eedf]">
                  {image ? (
                    <img
                      src={`/api/renderings/${image.id}`}
                      alt={`Concept visualization: ${idea.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-[#809470]">
                      <ImageIcon size={28} strokeWidth={1.2} />
                      <p className="text-xs">
                        Rendering: add image provider key
                      </p>
                      <p className="text-[10px]">
                        Your concept and rendering prompt are ready.
                      </p>
                    </div>
                  )}
                  <Badge className="absolute left-4 top-4 bg-white/85 backdrop-blur-sm">
                    {image
                      ? "AI concept visualization"
                      : "Concept awaiting rendering"}
                  </Badge>
                  <button
                    onClick={() => setDetail(idea.id)}
                    aria-label={`View ${idea.title}`}
                    className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-lg bg-white/80 text-primary"
                  >
                    <Expand size={14} />
                  </button>
                </div>
              ) : (
                <div className="dot-grid flex h-28 items-center justify-between border-b border-border bg-[#eaf0df] px-6">
                  <span className="display text-3xl text-[#829a6e]">
                    {lane === "athlete_creator"
                      ? "Human stories."
                      : "Built to travel."}
                  </span>
                  {lane === "athlete_creator" ? (
                    <Users
                      size={30}
                      strokeWidth={1.1}
                      className="text-[#8ca67a]"
                    />
                  ) : (
                    <Video
                      size={30}
                      strokeWidth={1.1}
                      className="text-[#8ca67a]"
                    />
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[#97a088]">
                    Concept {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex gap-2">
                    <Badge className="bg-white border border-border">
                      {idea.brief.budget} budget
                    </Badge>
                    <Badge>{average.toFixed(1)} / 5</Badge>
                  </div>
                </div>
                <button
                  onClick={() => setDetail(idea.id)}
                  className="display mt-3 text-left text-[29px] leading-tight"
                >
                  {idea.title}
                </button>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {idea.hook}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {idea.trendIds.map((id) => (
                    <Badge key={id} className="bg-[#f3f5ed] text-[9px]">
                      ↗{" "}
                      {allTrends.find((t) => t.id === id)?.title ??
                        "Archived signal"}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 line-clamp-3 text-[11px] leading-[1.8] text-muted-foreground">
                  {idea.concept}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <button
                    className="flex items-center gap-1 text-[11px] font-medium text-primary"
                    onClick={() => setDetail(idea.id)}
                  >
                    Explore the concept <ArrowUpRight size={13} />
                  </button>
                  <div className="flex gap-1">
                    <Button
                      aria-label={`Regenerate ${idea.title}`}
                      title="Regenerate"
                      size="icon"
                      variant="ghost"
                      disabled={locked}
                      onClick={() => run("regenerate", { outputId: idea.id })}
                    >
                      <RefreshCw size={13} />
                    </Button>
                    <Button
                      aria-label={`Edit ${idea.title}`}
                      title="Edit concept"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEdit(idea);
                        setEditError("");
                      }}
                    >
                      <Pencil size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <div className="paper flex flex-col items-center p-14 text-center">
          <Lightbulb className="text-[#8ba276]" size={30} strokeWidth={1.2} />
          <h2 className="display mt-5 text-3xl">A new space to explore.</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Select starred trends, choose your scope, and generate ideas
            grounded in the actual partnership rights.
          </p>
          <Button
            className="mt-6"
            disabled={locked || !selected.length}
            onClick={generate}
          >
            <Sparkles size={14} />
            Generate ideas for this scope
          </Button>
        </div>
      )}
      <p className="mt-7 text-[10px] leading-relaxed text-muted-foreground">
        Concepts are alternatives, not a committed production plan. Confirm
        rights, appearance allocation, permissions, budget, and compliance
        before activation. S $15–40k · M $40–100k · L $100–250k (excluding
        rights fees and media).
      </p>
      <Dialog open={choose} onOpenChange={setChoose}>
        <DialogContent>
          <DialogTitle className="display text-3xl">
            Start with a signal.
          </DialogTitle>
          <DialogDescription className="my-4 text-sm text-muted-foreground">
            Choose which shortlisted trends should shape the next round.
          </DialogDescription>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {starred.map((t) => (
              <label
                key={t.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-white p-3 text-xs"
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={selected.includes(t.id)}
                  onChange={(ev) =>
                    setSelected(
                      ev.target.checked
                        ? [...selected, t.id]
                        : selected.filter((id) => id !== t.id),
                    )
                  }
                />
                <span>
                  <span className="font-semibold">{t.title}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {t.category} · {t.relevanceScore}/100 brand relevance
                  </span>
                </span>
              </label>
            ))}
            {!starred.length && (
              <p className="text-sm text-muted-foreground">
                Star trends in Trend Tracking first.
              </p>
            )}
          </div>
          <Button className="mt-5 w-full" onClick={() => setChoose(false)}>
            Use selected signals
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={!!active} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-4xl">
          {active && (
            <>
              <Badge className="mb-4">{laneLabels[active.lane]}</Badge>
              <DialogTitle className="display text-4xl">
                {active.title}
              </DialogTitle>
              <DialogDescription className="mb-6 mt-3 text-sm text-muted-foreground">
                {active.hook}
              </DialogDescription>
              <Feedback {...w} />
              {active.lane === "experiential" && (
                <div className="mb-6 overflow-hidden rounded-xl bg-muted">
                  {active.renderings.find((r) => r.imageUrl) ? (
                    <img
                      src={`/api/renderings/${active.renderings.find((r) => r.imageUrl)!.id}`}
                      alt={`AI visualization of ${active.title}`}
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="p-12 text-center text-sm text-muted-foreground">
                      Rendering: add image provider key
                    </div>
                  )}
                </div>
              )}
              <div className="whitespace-pre-line text-sm leading-[1.9] text-[#64725e]">
                {active.concept}
              </div>
              <div className="my-7 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
                <Info label="The objective" text={active.brief.objective} />
                <Info
                  label="Rights & assets used"
                  text={active.brief.rights.join("\n")}
                />
                <Info label="Timing window" text={active.brief.timing} />
                <Info label="What we measure" text={active.brief.measurement} />
                <Info
                  label="Why a fan would post"
                  text={active.brief.fanReason}
                />
                <Info label="Risk notes" text={active.brief.risks.join("\n")} />
              </div>
              {active.lane === "athlete_creator" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Info label="Talent / archetype" text={active.brief.talent} />
                  <Info label="The ask" text={active.brief.ask} />
                  <Info
                    label="Content deliverables"
                    text={active.brief.deliverables?.join("\n")}
                  />
                  <Info
                    label="Three-beat storyline"
                    text={active.brief.storyline
                      ?.map((s, i) => `${i + 1}. ${s}`)
                      .join("\n")}
                  />
                  <Info label="Co-branding" text={active.brief.coBranding} />
                </div>
              )}
              {active.lane === "social" && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Info
                      label="Platform & format"
                      text={`${active.brief.platform} · ${active.brief.format}`}
                    />
                    <Info
                      label="First two seconds"
                      text={active.brief.openingHook}
                    />
                    <Info label="Publisher" text={active.brief.publisher} />
                    <Info label="Cadence" text={active.brief.cadence} />
                  </div>
                  <h3 className="mb-4 mt-7 text-sm font-semibold">
                    Three posts to start with
                  </h3>
                  {active.brief.posts?.map((p, i) => (
                    <div
                      key={i}
                      className="mb-3 rounded-lg border border-border bg-white p-4"
                    >
                      <p className="text-xs font-semibold">{p.concept}</p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {p.caption}
                      </p>
                    </div>
                  ))}
                </>
              )}
              {active.lane === "experiential" && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Info label="Location" text={active.brief.location} />
                    <Info label="Footprint" text={active.brief.footprint} />
                    <Info
                      label="The moment / ritual"
                      text={active.brief.ritual}
                    />
                    <Info label="Social capture" text={active.brief.capture} />
                  </div>
                  <details className="mt-6 rounded-lg border border-border bg-white p-4">
                    <summary className="text-xs font-medium">
                      View rendering prompt
                    </summary>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      {active.brief.renderingPrompt}
                    </p>
                  </details>
                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      disabled={locked}
                      variant="outline"
                      size="sm"
                      onClick={() => run("render", { outputId: active.id })}
                    >
                      <RefreshCw size={12} />
                      Re-render concept
                    </Button>
                    <span className="text-[9px] text-muted-foreground">
                      AI concept visualization · not an actual event
                    </span>
                  </div>
                  <h3 className="mb-4 mt-6 text-sm font-semibold">
                    Where else could it live?
                  </h3>
                  {active.brief.alternateLocations?.map((loc) => (
                    <div
                      key={loc.name}
                      className="mb-2 flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-xs font-semibold">{loc.name}</p>
                        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                          {loc.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={locked}
                        onClick={() =>
                          run("render", {
                            outputId: active.id,
                            location: loc.name,
                          })
                        }
                      >
                        Render here
                        <ArrowUpRight size={12} />
                      </Button>
                    </div>
                  ))}
                </>
              )}
              <div className="my-7 rounded-xl bg-[#edf2e4] p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold">
                    Make it work at your scale
                  </h3>
                  <Badge className="bg-white">
                    {active.brief.budget} budget
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={locked || active.brief.budget === "S"}
                    onClick={() =>
                      run("resize", {
                        outputId: active.id,
                        direction: "smaller",
                      })
                    }
                  >
                    <Minimize2 size={12} />
                    Make it smaller
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={locked || active.brief.budget === "L"}
                    onClick={() =>
                      run("resize", {
                        outputId: active.id,
                        direction: "bigger",
                      })
                    }
                  >
                    <Maximize2 size={12} />
                    Make it bigger
                  </Button>
                </div>
              </div>
              <h3 className="mb-4 text-sm font-semibold">
                The consultant's scorecard
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["originality", "Originality"],
                    ["brandFit", "Brand fit"],
                    ["feasibility", "Feasibility"],
                    ["socialVelocity", "Social velocity"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-xs"
                    key={key}
                  >
                    {label}
                    <select
                      className="w-20 py-1 text-xs"
                      aria-label={`${label} score`}
                      value={active.score[key]}
                      disabled={locked}
                      onChange={(ev) =>
                        run("score-output", {
                          outputId: active.id,
                          score: {
                            ...active.score,
                            [key]: Number(ev.target.value),
                          },
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} / 5
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="max-w-md text-[10px] text-muted-foreground">
                  {active.brief.provenance}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEdit(active);
                    setEditError("");
                    setDetail(null);
                  }}
                >
                  <Pencil size={12} />
                  Edit full idea
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-w-3xl">
          {edit && (
            <>
              <DialogTitle className="display text-3xl">
                Make the idea yours.
              </DialogTitle>
              <DialogDescription className="mb-6 mt-2 text-sm text-muted-foreground">
                Refine the story and the delivery details.
              </DialogDescription>
              <div className="space-y-4">
                <Field
                  label="Title"
                  value={edit.title}
                  onChange={(v) => setEdit({ ...edit, title: v })}
                />
                <Field
                  label="One-line hook"
                  value={edit.hook}
                  onChange={(v) => setEdit({ ...edit, hook: v })}
                />
                <Field
                  label="Concept"
                  area
                  value={edit.concept}
                  onChange={(v) => setEdit({ ...edit, concept: v })}
                />
                <BriefEditor
                  brief={edit.brief}
                  lane={edit.lane}
                  onChange={(brief) => setEdit({ ...edit, brief })}
                />
                <Feedback {...w} />
                {editError && (
                  <p role="alert" className="text-xs text-red-700">
                    {editError}
                  </p>
                )}
                <Button
                  disabled={locked}
                  className="w-full"
                  onClick={async () => {
                    try {
                      const brief = edit.brief;
                      if (
                        await run("save-output", {
                          outputId: edit.id,
                          title: edit.title,
                          hook: edit.hook,
                          concept: edit.concept,
                          brief,
                        })
                      ) {
                        setEdit(null);
                      }
                    } catch {
                      setEditError(
                        "Unable to save this idea. Please check the fields and retry.",
                      );
                    }
                  }}
                >
                  <Save size={13} />
                  Save idea
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
function Info({ label, text }: { label: string; text?: string }) {
  return (
    <div>
      <h3 className="eyebrow mb-2 text-[#8b997b]">{label}</h3>
      <p className="whitespace-pre-line text-xs leading-[1.8] text-[#66745f]">
        {text || "To be confirmed"}
      </p>
    </div>
  );
}
