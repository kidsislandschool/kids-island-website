import { unstable_cache } from "next/cache";
import { getSiteSettings } from "@/lib/content";
import { NextResponse } from "next/server";

const getCachedSiteSettings = unstable_cache(
  async () => {
    const result = await getSiteSettings();
    return result;
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);

export async function GET() {
  const data = await getCachedSiteSettings();
  return NextResponse.json(data);
}