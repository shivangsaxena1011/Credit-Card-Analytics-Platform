import { NextResponse } from "next/server";

// Authoritative Python FastAPI analytics engine base URL
const RAW_BACKEND_URL = process.env.BACKEND_URL;
const BACKEND_BASE_URL = (RAW_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Detection of cloud serverless environment (e.g. Vercel) where localhost is not available
const IS_VERCEL_OR_PROD = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
const IS_LOCALHOST_URL = !RAW_BACKEND_URL || BACKEND_BASE_URL.includes("127.0.0.1") || BACKEND_BASE_URL.includes("localhost");
const SKIP_DIRECT_LOCAL_FETCH = IS_VERCEL_OR_PROD && IS_LOCALHOST_URL;

/**
 * Returns diagnostic metadata about the active analytics engine configuration.
 */
export function getBackendConfig() {
  return {
    rawBackendUrl: RAW_BACKEND_URL || null,
    backendBaseUrl: BACKEND_BASE_URL,
    isVercelOrProd: IS_VERCEL_OR_PROD,
    isLocalhostUrl: IS_LOCALHOST_URL,
    skipDirectLocalFetch: SKIP_DIRECT_LOCAL_FETCH,
  };
}

/**
 * Proxies an API request from Next.js serverless route to the authoritative Python FastAPI backend.
 * Guarantees a single source of truth for all statistical, cleaning, and segmentation operations.
 * If backend is unreachable or unconfigured in serverless, it seamlessly and transparently
 * invokes the fallbackFn (TypeScript analytics engine) and decorates the response with engine metadata.
 */
export async function proxyToBackend(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  fallbackFn?: () => Promise<any>
) {
  // If running in production on Vercel and no external BACKEND_URL was set,
  // we know 127.0.0.1:8000 is unavailable. Run the standalone TypeScript engine directly.
  if (SKIP_DIRECT_LOCAL_FETCH && fallbackFn) {
    try {
      const fallbackData = await fallbackFn();
      const enrichedData = typeof fallbackData === "object" && fallbackData !== null
        ? {
            ...fallbackData,
            _engine: {
              source: "typescript-standalone",
              mode: "standalone",
              backend_reachable: false,
              backend_url: BACKEND_BASE_URL
            },
            engine: "typescript-standalone",
            fallback_used: true,
            backend_reachable: false
          }
        : fallbackData;

      return NextResponse.json(enrichedData, {
        headers: {
          "X-Engine-Source": "typescript-standalone",
          "X-Engine-Mode": "standalone",
          "X-Backend-Reachable": "false",
          "X-Fallback-Used": "true",
        }
      });
    } catch (fallbackErr: any) {
      return NextResponse.json(
        {
          error: `TypeScript standalone analytics engine failed: ${fallbackErr.message}`,
          engine: "none"
        },
        { status: 500 }
      );
    }
  }

  // Attempt communication with authoritative Python FastAPI backend
  try {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      // Fast 3.5s timeout prevents hanging requests during cold starts / unreachable networks
      signal: AbortSignal.timeout(3500),
    };

    if (body !== undefined && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      if (fallbackFn) {
        console.warn(`[CreditIQ] FastAPI returned HTTP ${response.status} for ${endpoint}. Invoking TypeScript fallback.`);
        const fallbackData = await fallbackFn();
        const enriched = typeof fallbackData === "object" && fallbackData !== null
          ? {
              ...fallbackData,
              _engine: {
                source: "typescript-standalone",
                mode: "fallback",
                backend_reachable: false,
                backend_status: response.status
              },
              engine: "typescript-standalone",
              fallback_used: true,
              backend_reachable: false
            }
          : fallbackData;

        return NextResponse.json(enriched, {
          headers: {
            "X-Engine-Source": "typescript-standalone",
            "X-Engine-Mode": "fallback",
            "X-Backend-Reachable": "false",
            "X-Fallback-Used": "true",
          }
        });
      }

      const errText = await response.text();
      return NextResponse.json(
        { error: `Authoritative Backend Error (${response.status}): ${errText}`, engine: "python-fastapi" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const enrichedData = typeof data === "object" && data !== null
      ? {
          ...data,
          _engine: {
            source: "python-fastapi",
            mode: "authoritative",
            backend_reachable: true,
            backend_url: BACKEND_BASE_URL
          },
          engine: "python-fastapi",
          fallback_used: false,
          backend_reachable: true
        }
      : data;

    return NextResponse.json(enrichedData, {
      headers: {
        "X-Engine-Source": "python-fastapi",
        "X-Engine-Mode": "authoritative",
        "X-Backend-Reachable": "true",
        "X-Fallback-Used": "false",
      }
    });
  } catch (error: any) {
    if (fallbackFn) {
      try {
        console.warn(`[CreditIQ] Backend connection failed for ${endpoint} (${error.message}). Invoking TypeScript fallback.`);
        const fallbackData = await fallbackFn();
        const enriched = typeof fallbackData === "object" && fallbackData !== null
          ? {
              ...fallbackData,
              _engine: {
                source: "typescript-standalone",
                mode: "fallback",
                backend_reachable: false,
                reason: error.message
              },
              engine: "typescript-standalone",
              fallback_used: true,
              backend_reachable: false
            }
          : fallbackData;

        return NextResponse.json(enriched, {
          headers: {
            "X-Engine-Source": "typescript-standalone",
            "X-Engine-Mode": "fallback",
            "X-Backend-Reachable": "false",
            "X-Fallback-Used": "true",
          }
        });
      } catch (fallbackErr: any) {
        return NextResponse.json(
          {
            error: `Backend unavailable at ${BACKEND_BASE_URL} and fallback failed: ${fallbackErr.message}`,
            engine: "none"
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        error: `Authoritative analytics backend unreachable at ${BACKEND_BASE_URL}. Ensure FastAPI is running or enable fallback.`,
        engine: "none",
        backend_reachable: false
      },
      { status: 502 }
    );
  }
}

/**
 * Proxies CSV export requests with fallback to local DataStore CSV generation.
 */
export async function proxyCsvToBackend(
  tableName: string,
  fallbackCsvFn: () => Promise<string> | string
) {
  const tbl = tableName.toLowerCase();

  if (SKIP_DIRECT_LOCAL_FETCH) {
    try {
      const csvData = await fallbackCsvFn();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`,
          "X-Engine-Source": "typescript-standalone",
        }
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to generate CSV: ${err.message}` }, { status: 500 });
    }
  }

  try {
    const url = `${BACKEND_BASE_URL}/api/export-csv/${tbl}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) {
      const csvData = await fallbackCsvFn();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`,
          "X-Engine-Source": "typescript-standalone",
          "X-Fallback-Used": "true"
        }
      });
    }

    const csvData = await response.text();
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`,
        "X-Engine-Source": "python-fastapi"
      }
    });
  } catch {
    try {
      const csvData = await fallbackCsvFn();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=creditiq_${tbl}.csv`,
          "X-Engine-Source": "typescript-standalone",
          "X-Fallback-Used": "true"
        }
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to download CSV: ${err.message}` }, { status: 500 });
    }
  }
}
