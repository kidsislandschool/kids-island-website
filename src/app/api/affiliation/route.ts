import { unstable_cache } from "next/cache";
import { getAffiliation } from "@/lib/content";
import { NextResponse } from "next/server";

const getCachedAffiliation = unstable_cache(
  async () => {
    const result = await getAffiliation();
    return result;
  },
  ["affiliation"],
  { revalidate: 60, tags: ["affiliation"] }
);

export async function GET() {
  const data = await getCachedAffiliation();
  return NextResponse.json(data ?? {});
}