import { unstable_cache } from "next/cache";
import { getMaterials } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedMaterials = unstable_cache(
  async (searchParams: URLSearchParams) => {
    const search = searchParams.get("q") || "";
    const classLevel = searchParams.get("classLevel") || "";
    const subject = searchParams.get("subject") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "9");
    
    const result = await getMaterials({ search, classLevel, subject, page, perPage });
    return NextResponse.json(result);
  },
  ["study-materials"],
  { revalidate: 60, tags: ["study-materials"] }
);

export async function GET(request: Request) {
  return getCachedMaterials(new URL(request.url).searchParams);
}