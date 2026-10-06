import { NextRequest } from "next/server";
import { proxyCsvToBackend } from "@/lib/backendProxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  return proxyCsvToBackend(table);
}
