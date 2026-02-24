/* eslint-env node */
"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const clampNumber = (value, fallback = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
};

const normalizeConfidence = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return "medium";
};

const normalizeScanPayload = (raw) => {
  const foods = Array.isArray(raw?.foods) ? raw.foods : [];
  return foods
    .slice(0, 12)
    .map((food) => {
      const name = String(food?.name ?? "").trim();
      if (!name) return null;
      return {
        name,
        portionLabel: String(food?.portionLabel ?? "").trim() || "1 serving",
        grams: Math.max(0, clampNumber(food?.grams, 0)),
        calories: Math.max(0, clampNumber(food?.calories, 0)),
        protein: Math.max(0, clampNumber(food?.protein, 0)),
        carbs: Math.max(0, clampNumber(food?.carbs, 0)),
        fat: Math.max(0, clampNumber(food?.fat, 0)),
        confidence: normalizeConfidence(food?.confidence),
      };
    })
    .filter(Boolean);
};

const analyzeMealImage = async ({ imageBase64, mimeType }) => {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const systemPrompt =
    "You are a nutrition assistant for Nigerian users. Identify visible foods and estimate portions and macros. Return strict JSON only.";
  const userPrompt = [
    "Analyze this meal photo.",
    "Return JSON object with this exact shape:",
    "{",
    '  "foods": [',
    "    {",
    '      "name": "string",',
    '      "portionLabel": "string",',
    '      "grams": number,',
    '      "calories": number,',
    '      "protein": number,',
    '      "carbs": number,',
    '      "fat": number,',
    '      "confidence": "high" | "medium" | "low"',
    "    }",
    "  ]",
    "}",
    "Rules:",
    "- Include all clearly visible foods; skip uncertain items.",
    "- Use realistic cooked-food estimates.",
    "- If no clear food found, return foods as an empty array.",
    "- Do not include any keys outside the required schema.",
  ].join("\n");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `OpenAI analyze failed (${response.status}): ${JSON.stringify(data)}`
    );
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned non-JSON scan output.");
  }
  return normalizeScanPayload(parsed);
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "metacal-api" });
});

app.post("/scan/analyze", async (req, res) => {
  try {
    const imageBase64 = String(req.body?.imageBase64 ?? "").trim();
    const mimeType = String(req.body?.mimeType ?? "image/jpeg").trim();

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required." });
    }

    const foods = await analyzeMealImage({ imageBase64, mimeType });
    return res.json({ foods });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`MetaCal API running on http://localhost:${port}`);
});
