import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(req: NextRequest) {
  const filters = await req.json().catch(() => ({}));
  return proxyToBackend("/api/overview", "POST", filters);
}
