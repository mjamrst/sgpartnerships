"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Upload,
  X,
  Pencil,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { discoverySections } from "@/lib/discovery";
import type { Answer, Engagement, Property } from "@/lib/types";
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
const lines = (s: string) => s.split("\n");
export function DiscoveryModule({ initial }: { initial: Engagement }) {
  const w = useWorkbench(initial);
  const { e, run, busy } = w;
  const [section, setSection] = useState(0);
  const [tab, setTab] = useState("inputs");
  const [answers, setAnswers] = useState<Answer[]>(initial.answers);
  const [brief, setBrief] = useState(initial.discoveryBrief);
  const [editBrief, setEditBrief] = useState(false);
  const [meta, setMeta] = useState(false);
  const [brand, setBrand] = useState(initial.brand);
  const [properties, setProperties] = useState(initial.brand.properties);
  const [name, setName] = useState(initial.name);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);
  function update(key: string, index: number, patch: Partial<Answer>) {
    setDirty(true);
    setAnswers((current) => {
      const next = [...current];
      const indexes = next
        .map((a, i) => (a.questionKey === key ? i : -1))
        .filter((i) => i >= 0);
      if (indexes[index] === undefined)
        next.push({
          questionKey: key,
          answer: "",
          source: "consultant",
          ...patch,
        });
      else next[indexes[index]] = { ...next[indexes[index]], ...patch };
      return next;
    });
  }
  async function save() {
    const updated = await run("save-discovery", { answers });
    if (updated) setDirty(false);
    return updated;
  }
  return (
    <Shell e={e}>
      <ModuleHeading
        step="01 / Brand Discovery"
        title="Start with understanding."
        description="The ambition, the history, the people. Build a shared foundation for everything that follows."
      >
        <Button variant="outline" onClick={() => setMeta(true)}>
          <Settings2 size={14} />
          Brand & portfolio
        </Button>
        <Button
          disabled={!!busy}
          onClick={async () => {
            const saved = await save();
            if (saved) {
              const updated = await run("synthesize");
              if (updated) {
                setBrief(updated.discoveryBrief);
                setTab("brief");
              }
            }
          }}
        >
          <Sparkles size={14} />
          Synthesize Discovery
        </Button>
      </ModuleHeading>
      <Feedback {...w} />
      <div className="mb-6 flex items-center gap-6 border-b border-border">
        <button
          className={`pb-3 text-xs ${tab === "inputs" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"}`}
          onClick={() => setTab("inputs")}
        >
          Discovery inputs{" "}
          <Badge className="ml-2">
            {answers.filter((a) => a.answer.trim()).length}
          </Badge>
        </button>
        <button
          className={`pb-3 text-xs ${tab === "brief" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"}`}
          onClick={() => setTab("brief")}
        >
          Discovery brief
        </button>
        <span className="ml-auto pb-3 text-[10px] text-muted-foreground">
          {dirty ? "Unsaved changes" : "A living foundation"}
        </span>
      </div>
      {tab === "inputs" ? (
        <div className="grid gap-6 xl:grid-cols-[215px_1fr]">
          <nav className="space-y-1">
            {discoverySections.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setSection(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left text-xs ${section === i ? "bg-[#e8efdd] text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <span className="font-mono text-[10px]">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{s.title}</span>
                {s.questions.every((q) =>
                  answers.some(
                    (a) => a.questionKey === q[0] && a.answer.trim(),
                  ),
                ) ? (
                  <Check size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
              </button>
            ))}
          </nav>
          <section className="paper p-6 md:p-8">
            <div className="mb-7 flex justify-between gap-4">
              <div>
                <p className="eyebrow mb-2 text-muted-foreground">
                  Section {String.fromCharCode(65 + section)}
                </p>
                <h2 className="text-xl font-semibold">
                  {discoverySections[section].title}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {discoverySections[section].description}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!!busy}
                onClick={save}
              >
                <Save size={13} />
                Save inputs
              </Button>
            </div>
            <div className="space-y-7">
              {discoverySections[section].questions.map(
                ([key, label, help]) => {
                  const rows = answers.filter((a) => a.questionKey === key);
                  if (!rows.length)
                    rows.push({
                      questionKey: key,
                      answer: "",
                      source:
                        key === "discord"
                          ? "discord"
                          : key === "reddit" || key === "comments"
                            ? "social"
                            : "consultant",
                    });
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          className="text-[13px] font-semibold"
                          htmlFor={`${key}-0`}
                        >
                          {label}
                        </label>
                        <button
                          className="flex items-center gap-1 text-[10px] text-muted-foreground"
                          onClick={() => {
                            setAnswers([
                              ...answers,
                              {
                                questionKey: key,
                                answer: "",
                                source:
                                  [
                                    "brand",
                                    "consultant",
                                    "discord",
                                    "social",
                                    "doc",
                                  ].find(
                                    (s) => !rows.some((r) => r.source === s),
                                  ) ?? "consultant",
                              },
                            ]);
                            setDirty(true);
                          }}
                          disabled={rows.length >= 5}
                        >
                          <Plus size={11} />
                          Add source
                        </button>
                      </div>
                      <p className="mb-3 text-[11px] text-muted-foreground">
                        {help}
                      </p>
                      {rows.map((row, i) => (
                        <div
                          key={i}
                          className="mb-3 rounded-lg border border-border bg-[#fafbf7] p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <select
                              aria-label={`${label} source ${i + 1}`}
                              className="w-32 border-0 bg-transparent px-0 py-1 text-[10px]"
                              value={row.source}
                              onChange={(ev) =>
                                update(key, i, { source: ev.target.value })
                              }
                            >
                              {[
                                "brand",
                                "consultant",
                                "discord",
                                "social",
                                "doc",
                              ].map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  disabled={rows.some(
                                    (r, j) => j !== i && r.source === s,
                                  )}
                                >
                                  {s === "social"
                                    ? "Social / Reddit"
                                    : s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                            {section === 5 && (
                              <label className="flex cursor-pointer items-center gap-1 text-[10px] text-primary">
                                <Upload size={11} />
                                Upload text
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept=".txt,.md,.csv,.json"
                                  onChange={async (ev) => {
                                    const file = ev.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 250000) {
                                      setUploadError(
                                        "Please choose a text export smaller than 250 KB.",
                                      );
                                      return;
                                    }
                                    setUploadError("");
                                    update(key, i, {
                                      answer: await file.text(),
                                      source: row.source,
                                    });
                                  }}
                                />
                              </label>
                            )}
                          </div>
                          <textarea
                            id={`${key}-${i}`}
                            aria-label={`${label} answer ${i + 1}`}
                            rows={3}
                            value={row.answer}
                            onChange={(ev) =>
                              update(key, i, {
                                answer: ev.target.value,
                                source: row.source,
                              })
                            }
                            className="min-h-24 border-0 bg-white text-xs leading-relaxed"
                            placeholder="Add the detail that matters…"
                          />
                        </div>
                      ))}
                    </div>
                  );
                },
              )}
            </div>
            {uploadError && (
              <p role="alert" className="text-xs text-red-700">
                {uploadError}
              </p>
            )}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <span className="text-[10px] text-muted-foreground">
                Sources stay attached to every answer.
              </span>
              <Button
                variant="outline"
                onClick={async () => {
                  if (await save()) setSection(Math.min(section + 1, 5));
                }}
                disabled={!!busy}
              >
                {section < 5 ? "Save & next section" : "Save section"}
                <ArrowRight size={13} />
              </Button>
            </div>
          </section>
        </div>
      ) : (
        <div className="paper mx-auto max-w-4xl p-7 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Badge>
                <FileText size={11} />
                Discovery brief
              </Badge>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Review and refine before sharing with the client.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={async () => {
                if (editBrief) {
                  if (await run("save-brief", { markdown: brief }))
                    setEditBrief(false);
                } else setEditBrief(true);
              }}
            >
              {editBrief ? (
                <>
                  <Save size={12} />
                  Save brief
                </>
              ) : (
                <>
                  <Pencil size={12} />
                  Edit brief
                </>
              )}
            </Button>
          </div>
          {editBrief ? (
            <textarea
              aria-label="Discovery brief markdown"
              rows={26}
              value={brief}
              onChange={(ev) => setBrief(ev.target.value)}
              className="font-mono text-xs"
            />
          ) : (
            <div className="markdown">
              <ReactMarkdown>
                {e.discoveryBrief ||
                  "No brief yet. Complete the questionnaire, then synthesize discovery."}
              </ReactMarkdown>
            </div>
          )}
          <div className="mt-9 border-t border-border pt-6">
            <Button asChild>
              <Link href={`/engagements/${e.id}/audiences`}>
                Continue to audience set-up
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <Dialog open={meta} onOpenChange={setMeta}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="display text-3xl">
            Brand & portfolio
          </DialogTitle>
          <DialogDescription className="mb-6 mt-2 text-sm text-muted-foreground">
            The source of truth for names, objectives, and contracted rights.
          </DialogDescription>
          <Feedback {...w} />
          <div className="space-y-4">
            <Field label="Engagement name" value={name} onChange={setName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Brand name"
                value={brand.name}
                onChange={(v) => setBrand({ ...brand, name: v })}
              />
              <Field
                label="Category"
                value={brand.category}
                onChange={(v) => setBrand({ ...brand, category: v })}
              />
            </div>
            {(
              [
                ["objectives", "Objectives"],
                ["history", "Campaign history & prior partners"],
                ["constraints", "Constraints & no-gos"],
                ["sources", "Source inventory"],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={`${label} · one per line`}
                area
                value={brand[key].join("\n")}
                onChange={(v) => setBrand({ ...brand, [key]: lines(v) })}
              />
            ))}
            <Field
              label="Tone of voice"
              area
              value={brand.toneOfVoice}
              onChange={(v) => setBrand({ ...brand, toneOfVoice: v })}
            />
            <div className="flex items-center justify-between pt-4">
              <h3 className="font-semibold">Partnership portfolio</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setProperties([
                    ...properties,
                    {
                      id: `new-${Date.now()}`,
                      name: "New property",
                      type: "event",
                      assets: [],
                      dealTerms: {
                        term: "",
                        relationship: "",
                        activated: [],
                        unused: [],
                      },
                    },
                  ])
                }
              >
                <Plus size={12} />
                Add property
              </Button>
            </div>
            {properties.map((p, i) => {
              const change = (patch: Partial<Property>) =>
                setProperties(
                  properties.map((v, j) => (i === j ? { ...v, ...patch } : v)),
                );
              return (
                <div
                  key={p.id}
                  className="space-y-3 rounded-xl border border-border p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Property name"
                      value={p.name}
                      onChange={(v) => change({ name: v })}
                    />
                    <label className="text-xs">
                      Type
                      <select
                        className="mt-2"
                        value={p.type}
                        onChange={(ev) => change({ type: ev.target.value })}
                      >
                        {[
                          "team",
                          "league",
                          "event",
                          "venue",
                          "festival",
                          "athlete",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Field
                    label="Deal term"
                    value={p.dealTerms.term}
                    onChange={(v) =>
                      change({ dealTerms: { ...p.dealTerms, term: v } })
                    }
                  />
                  <Field
                    label="Partnership role"
                    value={p.dealTerms.relationship}
                    onChange={(v) =>
                      change({ dealTerms: { ...p.dealTerms, relationship: v } })
                    }
                  />
                  <Field
                    area
                    label="Contracted assets · one per line"
                    value={p.assets.join("\n")}
                    onChange={(v) => change({ assets: lines(v) })}
                  />
                  {(["activated", "unused"] as const).map((key) => (
                    <Field
                      key={key}
                      area
                      label={
                        key === "activated"
                          ? "Already activated · one per line"
                          : "Unused rights · one per line"
                      }
                      value={p.dealTerms[key].join("\n")}
                      onChange={(v) =>
                        change({
                          dealTerms: { ...p.dealTerms, [key]: lines(v) },
                        })
                      }
                    />
                  ))}
                </div>
              );
            })}
            <Button
              disabled={!!busy}
              className="w-full"
              onClick={async () => {
                const updated = await run("save-brand", {
                  name,
                  brand,
                  properties,
                });
                if (updated) {
                  setAnswers(updated.answers);
                  setBrand(updated.brand);
                  setProperties(updated.brand.properties);
                  setMeta(false);
                }
              }}
            >
              <Save size={14} />
              Save brand & portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
export function Field({
  label,
  value,
  onChange,
  area = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
}) {
  return (
    <label className="block text-xs">
      {label}
      {area ? (
        <textarea
          className="mt-2 text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="mt-2 text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
