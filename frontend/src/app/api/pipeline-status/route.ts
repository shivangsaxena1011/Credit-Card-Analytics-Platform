import { proxyToBackend } from "@/lib/backendProxy";

export async function GET() {
  return proxyToBackend("/api/pipeline-status", "GET");
}
