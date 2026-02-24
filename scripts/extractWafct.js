const fs = require("fs");
const path = require("path");

let XLSX;
try {
  XLSX = require("xlsx");
} catch (error) {
  console.error(
    "Missing dependency: xlsx. Run `npm install xlsx` then run this script again.",
  );
  process.exit(1);
}

const workbookPath = path.resolve(
  __dirname,
  "..",
  "app",
  "data",
  "raw",
  "WAFCT_2019.xlsx",
);
const outputPath = path.resolve(
  __dirname,
  "..",
  "app",
  "data",
  "wafctFoods.json",
);

const COL = {
  code: 0, // A
  name: 1, // B
  kcal: 7, // H
  protein: 9, // J
  fat: 10, // K
  carbs: 11, // L
};

// Default to sheet 3 (index 2) where nutrient values are stored.
const DEFAULT_SHEET_INDEX = 2;

const asNumber = (value) => {
  if (value == null || value === "") return null;
  const normalized = String(value)
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(",", ".")
    .replace(/[\[\]\(\)]/g, "")
    .replace(/\*/g, "")
    .replace(/^</, "")
    .trim();

  if (!normalized) return null;
  if (/^tr$/i.test(normalized)) return 0;

  const numeric = normalized.match(/-?\d+(\.\d+)?/);
  if (!numeric) return null;

  const parsed = Number(numeric[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const isLikelyFoodRow = (row) => {
  if (!Array.isArray(row)) return false;
  const name = row[COL.name];
  if (!name || typeof name !== "string") return false;
  const hasAnyMacro =
    asNumber(row[COL.kcal]) != null ||
    asNumber(row[COL.protein]) != null ||
    asNumber(row[COL.carbs]) != null ||
    asNumber(row[COL.fat]) != null;
  return hasAnyMacro;
};

const toId = (name, index) =>
  `wafct-${String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)}-${index}`;

const cleanNamePart = (text) =>
  String(text || "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toNameFields = (rawName) => {
  const fullName = cleanNamePart(rawName);
  const split = fullName.split(":");
  const primary = cleanNamePart(split[0]);
  const secondary =
    split.length > 1 ? cleanNamePart(split.slice(1).join(":")) : null;
  const displayName =
    primary.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim() || primary;
  const searchText = [displayName, primary, secondary, fullName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return { fullName, primary, secondary, displayName, searchText };
};

if (!fs.existsSync(workbookPath)) {
  console.error(`Workbook not found: ${workbookPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(workbookPath);
const sheetArg = process.argv[2];
let sheetName = workbook.SheetNames[DEFAULT_SHEET_INDEX];

if (sheetArg) {
  const numericIndex = Number(sheetArg);
  if (Number.isInteger(numericIndex) && numericIndex >= 1) {
    sheetName = workbook.SheetNames[numericIndex - 1];
  } else if (workbook.SheetNames.includes(sheetArg)) {
    sheetName = sheetArg;
  }
}

if (!sheetName) {
  console.error("Invalid sheet selection.");
  console.error("Available sheets:");
  workbook.SheetNames.forEach((name, index) =>
    console.error(`${index + 1}: ${name}`),
  );
  process.exit(1);
}

const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: null,
  raw: false,
});

const foods = rows
  .filter(isLikelyFoodRow)
  .map((row, index) => {
    const nameFields = toNameFields(row[COL.name]);
    return {
      id: toId(nameFields.fullName, index + 1),
      code: row[COL.code] != null ? String(row[COL.code]).trim() : null,
      name: nameFields.fullName,
      displayName: nameFields.displayName,
      namePrimary: nameFields.primary,
      nameSecondary: nameFields.secondary,
      searchText: nameFields.searchText,
      per100g: {
        calories: asNumber(row[COL.kcal]),
        protein: asNumber(row[COL.protein]),
        carbs: asNumber(row[COL.carbs]),
        fat: asNumber(row[COL.fat]),
      },
      source: {
        dataset: "WAFCT 2019",
        sheet: sheetName,
      },
    };
  });

const payload = {
  generatedAt: new Date().toISOString(),
  sourceFile: "app/data/raw/WAFCT_2019.xlsx",
  sheet: sheetName,
  columns: {
    name: "B",
    calories: "H",
    protein: "J",
    fat: "K",
    carbs: "L",
  },
  count: foods.length,
  foods,
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Exported ${foods.length} foods to ${outputPath}`);
