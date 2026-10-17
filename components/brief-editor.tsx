"use client";
import type { IdeaBrief, Lane } from "@/lib/types";
import { Field } from "./discovery-module";
export function BriefEditor({
  brief,
  lane,
  onChange,
}: {
  brief: IdeaBrief;
  lane: Lane;
  onChange: (brief: IdeaBrief) => void;
}) {
  const text = (key: keyof IdeaBrief, label: string) => (
    <Field
      key={key}
      area
      label={label}
      value={String(brief[key] ?? "")}
      onChange={(value) => onChange({ ...brief, [key]: value })}
    />
  );
  const list = (
    key: "rights" | "risks" | "deliverables" | "storyline",
    label: string,
  ) => (
    <Field
      key={key}
      area
      label={`${label} · one per line`}
      value={(brief[key] ?? []).join("\n")}
      onChange={(value) => onChange({ ...brief, [key]: value.split("\n") })}
    />
  );
  return (
    <div className="space-y-4">
      {text("objective", "Objective served")}
      {list("rights", "Contracted rights used")}
      <label className="block text-xs">
        Budget band
        <select
          className="mt-2"
          value={brief.budget}
          onChange={(e) =>
            onChange({
              ...brief,
              budget: e.target.value as IdeaBrief["budget"],
            })
          }
        >
          <option value="S">S · $15–40k</option>
          <option value="M">M · $40–100k</option>
          <option value="L">L · $100–250k</option>
        </select>
      </label>
      {text("timing", "Timing window")}
      {text("measurement", "Measurement plan")}
      {text("fanReason", "Why a fan would post")}
      {list("risks", "Risk notes")}
      {lane === "athlete_creator" && (
        <>
          {text("talent", "Athlete or creator archetype")}
          {text("ask", "The ask")}
          {list("deliverables", "Content deliverables")}
          {list("storyline", "Three-beat storyline")}
          {text("coBranding", "Co-branding notes")}
        </>
      )}
      {lane === "experiential" && (
        <>
          {text("location", "Location")}
          {text("footprint", "Footprint")}
          {text("ritual", "Moment or ritual")}
          {text("capture", "Social capture mechanic")}
          {text("renderingPrompt", "Rendering prompt")}
          <h3 className="pt-3 text-sm font-semibold">Alternate locations</h3>
          {brief.alternateLocations?.map((location, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <Field
                label={`Location ${i + 1}`}
                value={location.name}
                onChange={(name) =>
                  onChange({
                    ...brief,
                    alternateLocations: brief.alternateLocations!.map((l, j) =>
                      j === i ? { ...l, name } : l,
                    ),
                  })
                }
              />
              <Field
                label="Context & permissions"
                area
                value={location.description}
                onChange={(description) =>
                  onChange({
                    ...brief,
                    alternateLocations: brief.alternateLocations!.map((l, j) =>
                      j === i ? { ...l, description } : l,
                    ),
                  })
                }
              />
            </div>
          ))}
        </>
      )}
      {lane === "social" && (
        <>
          {text("platform", "Platform")}
          {text("format", "Format")}
          {text("openingHook", "Hook in the first two seconds")}
          {text("publisher", "Creator or brand handle")}
          {text("cadence", "Cadence")}
          <h3 className="pt-3 text-sm font-semibold">Example posts</h3>
          {brief.posts?.map((post, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <Field
                label={`Post ${i + 1} concept`}
                value={post.concept}
                onChange={(concept) =>
                  onChange({
                    ...brief,
                    posts: brief.posts!.map((p, j) =>
                      j === i ? { ...p, concept } : p,
                    ),
                  })
                }
              />
              <Field
                label="Draft caption"
                area
                value={post.caption}
                onChange={(caption) =>
                  onChange({
                    ...brief,
                    posts: brief.posts!.map((p, j) =>
                      j === i ? { ...p, caption } : p,
                    ),
                  })
                }
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
