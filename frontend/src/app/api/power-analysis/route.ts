import { NextRequest, NextResponse } from "next/server";
import { calculatePowerAndSampleSize } from "@/lib/analytics/powerAnalysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = calculatePowerAndSampleSize(
      body.alpha !== undefined ? Number(body.alpha) : 0.05,
      body.power !== undefined ? Number(body.power) : 0.80,
      body.effect_size !== undefined ? Number(body.effect_size) : 0.20,
      body.alternative || "larger"
    );
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate power analysis" }, { status: 500 });
  }
}
