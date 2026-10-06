import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/insights", "POST", body);
}
