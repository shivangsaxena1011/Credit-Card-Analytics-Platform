import { proxyToBackend } from "@/lib/backendProxy";

export async function POST() {
  return proxyToBackend("/api/export-report", "POST");
}
