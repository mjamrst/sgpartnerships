import { notFound } from "next/navigation";
import { getEngagement } from "@/lib/data";
import { Overview } from "@/components/overview";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await getEngagement(id);
  if (!e) notFound();
  return <Overview e={e} />;
}
