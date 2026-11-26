import { unstable_cache } from "next/cache";
import { getPublishedFaqs } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedFaqs = unstable_cache(
  async () => {
    const result = await getPublishedFaqs();
    return result;
  },
  ["faqs"],
  { revalidate: 60, tags: ["faqs"] }
);

export async function GET() {
  const data = await getCachedFaqs();
  return NextResponse.json(data);
}