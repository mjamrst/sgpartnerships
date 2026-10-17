import { getEngagements } from "@/lib/data";
import { db } from "@/lib/db";
import { EngagementList } from "@/components/engagement-list";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [items, brands] = await Promise.all([
    getEngagements(),
    db.brand.findMany({
      include: { properties: { select: { id: true, name: true } } },
    }),
  ]);
  return (
    <EngagementList items={JSON.parse(JSON.stringify(items))} brands={brands} />
  );
}
