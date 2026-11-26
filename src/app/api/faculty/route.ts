import { unstable_cache } from "next/cache";
import { getPublishedFaculty } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedFaculty = unstable_cache(
  async () => {
    const result = await getPublishedFaculty();
    return result;
  },
  ["faculty"],
  { revalidate: 60, tags: ["faculty"] }
);

export async function GET() {
  const data = await getCachedFaculty();
  return NextResponse.json(data);
}