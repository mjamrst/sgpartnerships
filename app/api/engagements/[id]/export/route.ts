import { NextRequest, NextResponse } from "next/server";
import { getEngagement } from "@/lib/data";
import { clientDeck, scopeExport } from "@/lib/export";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const e = await getEngagement(id);
    if (!e)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 },
      );
    const format = req.nextUrl.searchParams.get("format") ?? "html";
    if (!["html", "json"].includes(format))
      return NextResponse.json(
        { error: "Choose HTML or JSON export" },
        { status: 400 },
      );
    const scope =
      req.nextUrl.searchParams.get("scope") === "brand" ? "brand" : "property";
    const filtered = scopeExport(
      e,
      scope,
      req.nextUrl.searchParams.get("propertyId") ?? e.propertyId ?? "",
    );
    const content =
      format === "json"
        ? JSON.stringify(
            {
              ...filtered,
              exportedAt: new Date().toISOString(),
              dataNotice:
                "Fictional demo intelligence; AI concept visualizations.",
            },
            null,
            2,
          )
        : await clientDeck(filtered);
    return new Response(content, {
      headers: {
        "Content-Type":
          format === "json"
            ? "application/json; charset=utf-8"
            : "text/html; charset=utf-8",
        "Content-Disposition": `${req.nextUrl.searchParams.has("inline") ? "inline" : "attachment"}; filename="sg-partnerships-${scope}.${format}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Export failed", err instanceof Error ? err.name : "unknown");
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to build export. Try again.",
      },
      { status: 400 },
    );
  }
}
