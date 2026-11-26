import { unstable_cache } from "next/cache";
import { getNoticeCategories } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedNoticeCategoriesData = unstable_cache(
  async () => {
    const categories = await getNoticeCategories();
    return categories;
  },
  ["notice-categories"],
  { revalidate: 300, tags: ["notice-categories"] }
);

export async function GET() {
  const data = await getCachedNoticeCategoriesData();
  return NextResponse.json(data);
}