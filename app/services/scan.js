import { API_BASE_URL } from "../config/api";

const parseJsonOrThrow = async (response) => {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const preview = raw.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(
      `Server returned non-JSON (HTTP ${response.status}). Check API URL ${API_BASE_URL}. Response starts with: ${preview}`,
    );
  }
};

export async function analyzeFoodImage(imageBase64, mimeType = "image/jpeg") {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/scan/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new Error(`Network error: ${message}. Check server URL ${API_BASE_URL}.`);
  }

  const data = await parseJsonOrThrow(response);
  if (!response.ok) {
    throw new Error(data?.error || "Scan analyze failed.");
  }

  return Array.isArray(data?.foods) ? data.foods : [];
}
