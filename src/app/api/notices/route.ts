import { unstable_cache } from "next/cache";
import { getNotices } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedNotices = unstable_cache(
  async (searchParams: URLSearchParams) => {
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "9");
    
    const result = await getNotices({ search, category, page, perPage });
    return NextResponse.json(result);
  },
  ["notices"],
  { revalidate: 60, tags: ["notices"] }
);

export async function GET(request: Request) {
  return getCachedNotices(new URL(request.url).searchParams);
}