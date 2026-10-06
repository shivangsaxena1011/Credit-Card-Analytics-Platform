import { NextResponse } from "next/server";

/**
 * Resolves the backend base URL dynamically.
 * Prioritizes:
 * 1. BACKEND_URL (injected automatically via Vercel Services binding)
 * 2. VERCEL_URL (injected automatically on Vercel preview/production deployments)
 * 3. Localhost (ONLY in local development when NODE_ENV !== "production")
 */
function getBackendBaseUrl(): string | null {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_URL.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:8000";
  }
  return null;
}

/**
 * Proxies an API request from Next.js route directly to the Python FastAPI backend.
 * FastAPI serves as the single authoritative analytics engine.
 */
export async function proxyToBackend(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any
) {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        error:
          "FastAPI analytics engine is not reachable: BACKEND_URL service binding is not configured for production. Please verify your Vercel Services setup.",
        engine: "python-fastapi",
      },
      { status: 503 }
    );
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };

    if (body !== undefined && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          "X-Engine-Source": "python-fastapi",
        },
      });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "text/plain",
        "X-Engine-Source": "python-fastapi",
      },
    });
  } catch (err: any) {
    console.error(`[CreditIQ] FastAPI proxy error for ${url}:`, err.message);
    return NextResponse.json(
      {
        error: `FastAPI analytics engine is unreachable at ${url}. (${err.message})`,
        engine: "python-fastapi",
      },
      { status: 502 }
    );
  }
}

/**
 * Proxies a CSV export request directly from the Python FastAPI backend.
 */
export async function proxyCsvToBackend(tableName: string) {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    return new NextResponse(
      "Error: FastAPI backend service binding is not configured. Please verify your Vercel Services setup.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }

  const url = `${baseUrl}/api/export-csv/${tableName}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }

    const csvContent = await response.text();
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=creditiq_${tableName}.csv`,
        "X-Engine-Source": "python-fastapi",
      },
    });
  } catch (err: any) {
    console.error(`[CreditIQ] FastAPI CSV proxy error for ${url}:`, err.message);
    return new NextResponse(`Error: FastAPI backend unreachable (${err.message})`, {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
