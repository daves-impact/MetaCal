import { API_BASE_URL } from "../config/api";

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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Scan analyze failed.");
  }

  return Array.isArray(data?.foods) ? data.foods : [];
}
