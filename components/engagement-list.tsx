"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Plus, Search, Star, ArrowRight } from "lucide-react";
import { Shell } from "./shell";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
type Item = {
  id: string;
  name: string;
  scope: string;
  createdAt: string;
  brand: { id: string; name: string; category: string };
  property: { name: string } | null;
  _count: { audiences: number; outputs: number };
};
export function EngagementList({
  items,
  brands,
}: {
  items: Item[];
  brands: {
    id: string;
    name: string;
    properties: { id: string; name: string }[];
  }[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState(brands[0]?.id ?? "new");
  const [scope, setScope] = useState("property");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <Shell>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-4 text-muted-foreground">
            The partnership workbench
          </p>
          <h1 className="display text-5xl">
            Good partnerships.
            <br />
            <span className="text-[#77915d]">Greater possibilities.</span>
          </h1>
          <p className="mt-5 text-sm text-muted-foreground">
            A clear path from what audiences care about to what brands can do
            next.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} />
          New engagement
        </Button>
      </div>
      <div className="mb-5 flex items-center justify-between gap-5">
        <h2 className="text-base font-semibold">
          Your engagements{" "}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {items.length}
          </span>
        </h2>
        <div className="relative w-64">
          <Search
            size={15}
            className="absolute left-3 top-3 text-muted-foreground"
          />
          <input
            className="pl-9 text-xs"
            aria-label="Search engagements"
            placeholder="Find an engagement…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items
          .filter((e) =>
            (e.name + e.brand.name)
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((e) => (
            <Link
              key={e.id}
              href={`/engagements/${e.id}`}
              className="group paper overflow-hidden hover:border-[#9db38b] hover:shadow-sm"
            >
              <div className="dot-grid flex h-36 items-center justify-between bg-[#e9efdf] px-7">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[#d1dec4] bg-[#f7f9f0]">
                  <Star
                    size={29}
                    strokeWidth={1.1}
                    className="text-[#56774c]"
                  />
                </div>
                <span className="display text-4xl text-[#78916b]">
                  {e.brand.name.split(" ")[0]}
                  <span className="ml-2 text-[#b4c3a5]">↗</span>
                </span>
              </div>
              <div className="p-6">
                <div className="flex justify-between">
                  <Badge>
                    {e.scope === "brand" ? "Brand-wide" : "Property-specific"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Active
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold">{e.name}</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {e.brand.category} · {e.property?.name ?? "Full portfolio"}
                </p>
                <div className="mt-7 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-[11px] text-muted-foreground">
                    {e._count.audiences} audiences{" "}
                    <span className="mx-2">·</span>
                    {e._count.outputs} ideas
                  </span>
                  <ArrowUpRight size={18} className="text-primary" />
                </div>
              </div>
            </Link>
          ))}
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#cfdcc4] bg-[#f4f6ef] text-[#8a9a7d] hover:bg-[#eaf0e1]"
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-[#d9e2d0]">
            <Plus size={21} strokeWidth={1.2} />
          </span>
          <span className="text-sm">Start a new possibility</span>
          <span className="text-[10px]">
            Bring a brand. Build a point of view.
          </span>
        </button>
      </div>
      <div className="mt-12 flex gap-4 rounded-xl border border-[#dfe6d5] bg-[#eff3e7] p-6">
        <span className="display text-3xl text-[#8ba176]">01—04</span>
        <div>
          <h3 className="text-sm font-semibold">
            A connected process, from the first question to the final concept.
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Discovery → Audiences → Trends → Creative outputs. Every idea starts
            with evidence, context, and a clear reason to exist.
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="display text-3xl">
            A new engagement
          </DialogTitle>
          <DialogDescription className="mt-2 mb-7 text-sm text-muted-foreground">
            Choose a brand and the partnership space you want to explore.
          </DialogDescription>
          <form
            className="space-y-4"
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(ev.currentTarget);
              try {
                const response = await fetch("/api/engagements", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(form)),
                });
                const data = await response.json();
                if (!response.ok) throw Error(data.error);
                router.push(`/engagements/${data.id}`);
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Unable to create engagement",
                );
                setBusy(false);
              }
            }}
          >
            <label className="block text-xs">
              Engagement name
              <input
                name="name"
                required
                maxLength={100}
                className="mt-2"
                placeholder="e.g. A new season of possibility"
              />
            </label>
            <label className="block text-xs">
              Brand
              <select
                className="mt-2"
                name="brandId"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                {brands.map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="new">Create a new brand…</option>
              </select>
            </label>
            {brand === "new" && (
              <label className="block text-xs">
                New brand name
                <input required name="brandName" className="mt-2" />
              </label>
            )}
            <label className="block text-xs">
              Scope
              <select
                className="mt-2"
                name="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="property">Property-specific</option>
                <option value="brand">Brand-wide</option>
              </select>
            </label>
            {scope === "property" &&
              (brand === "new" ? (
                <label className="block text-xs">
                  Property name
                  <input name="propertyName" required className="mt-2" />
                </label>
              ) : (
                <label className="block text-xs">
                  Property
                  <select name="propertyId" required className="mt-2">
                    {brands
                      .find((b) => b.id === brand)
                      ?.properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            {error && (
              <p role="alert" className="text-xs text-red-700">
                {error}
              </p>
            )}
            <Button disabled={busy} className="w-full">
              {busy ? "Creating…" : "Create engagement"}
              <ArrowRight size={15} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
