import { getToken } from "./auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Terjadi kesalahan pada server");
  }

  return data as T;
}
