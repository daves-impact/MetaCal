import { API_BASE_URL } from "../config/api";

export async function searchFoods(query, pageNumber = 0, maxResults = 20) {
  const response = await fetch(`${API_BASE_URL}/fatsecret/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, pageNumber, maxResults }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "FatSecret search failed.");
  }
  return data;
}

export async function getFood(foodId) {
  const response = await fetch(`${API_BASE_URL}/fatsecret/food/${foodId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "FatSecret food fetch failed.");
  }
  return data;
}
