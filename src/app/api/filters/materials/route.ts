import { unstable_cache } from "next/cache";
import { getMaterials } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedMaterialFiltersData = unstable_cache(
  async () => {
    const result = await getMaterials({ perPage: 1 });
    return {
      classLevels: result.classLevels,
      subjects: result.subjects,
    };
  },
  ["material-filters"],
  { revalidate: 300, tags: ["material-filters"] }
);

export async function GET() {
  const data = await getCachedMaterialFiltersData();
  return NextResponse.json(data);
}