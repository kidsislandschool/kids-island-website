import { unstable_cache } from "next/cache";
import { getNoticeCategories } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedNoticeCategories = unstable_cache(
  async () => {
    const categories = await getNoticeCategories();
    return NextResponse.json(categories);
  },
  ["notice-categories"],
  { revalidate: 300, tags: ["notice-categories"] }
);

export async function GET() {
  return getCachedNoticeCategories();
}