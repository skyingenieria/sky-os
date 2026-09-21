import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/catalogos";
import CatalogManager from "@/components/CatalogManager";

export const dynamic = "force-dynamic";

export default async function CatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getCatalog(slug);
  if (!def) notFound();

  const supabase = await createClient();
  const computedCols = (def.computed ?? []).map((c) => c.key);
  const cols = ["id", ...def.fields.map((f) => f.key), ...computedCols].join(",");

  const { data, error } = await supabase
    .from(def.table)
    .select(cols)
    .order(def.orderBy, { ascending: def.ascending ?? true });

  return (
    <CatalogManager
      def={def}
      rows={(data as unknown as Record<string, string | number | null>[]) ?? []}
      loadError={error?.message ?? null}
    />
  );
}
