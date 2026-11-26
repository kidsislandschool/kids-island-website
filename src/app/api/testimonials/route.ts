import { unstable_cache } from "next/cache";
import { getPublishedTestimonials } from "@/lib/data";
import { NextResponse } from "next/server";

const getCachedTestimonials = unstable_cache(
  async () => {
    const result = await getPublishedTestimonials();
    return result;
  },
  ["testimonials"],
  { revalidate: 60, tags: ["testimonials"] }
);

export async function GET() {
  const data = await getCachedTestimonials();
  return NextResponse.json(data);
}