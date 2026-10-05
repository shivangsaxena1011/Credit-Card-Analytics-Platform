import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";
import { calculatePowerAndSampleSize } from "@/lib/analytics/powerAnalysis";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend("/api/power-analysis", "POST", body, async () => {
    return calculatePowerAndSampleSize(
      body.alpha !== undefined ? Number(body.alpha) : 0.05,
      body.power !== undefined ? Number(body.power) : 0.80,
      body.effect_size !== undefined ? Number(body.effect_size) : 0.20,
      body.alternative || "larger"
    );
  });
}
