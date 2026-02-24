const make = (
  id,
  name,
  category,
  servingLabel,
  servingGrams,
  tags = [],
) => {
  const mapEntry = NIGERIA_WAFCT_MAP[id];
  const per100 = mapEntry ? WAFCT_PER_100G_BY_CODE[mapEntry.code] : null;

  const toServingValue = (key, roundToInt = false) => {
    if (!per100 || per100[key] == null) return null;
    const value = (per100[key] * servingGrams) / 100;
    return roundToInt ? Math.round(value) : Number(value.toFixed(1));
  };

  return {
    id,
    name,
    category,
    servingLabel,
    servingGrams,
    calories: toServingValue("calories", true),
    protein: toServingValue("protein"),
    carbs: toServingValue("carbs"),
    fat: toServingValue("fat"),
    tags,
    servings: [
      { label: servingLabel, grams: servingGrams },
      { label: "Half serving", grams: Math.round(servingGrams / 2) },
      { label: "Double serving", grams: servingGrams * 2 },
    ],
    source: mapEntry ? "wafct" : "local",
    sourceCode: mapEntry?.code ?? null,
    dataConfidence: mapEntry?.confidence ?? "none",
  };
};

const WAFCT_PER_100G_BY_CODE = {
  "02_041": { calories: 165, protein: 1, carbs: 38.7, fat: 0.4 },
  "02_097": { calories: 97, protein: 1.8, carbs: 19.6, fat: 0.3 },
  "01_111": { calories: 130, protein: 2.3, carbs: 26.8, fat: 1.1 },
  "01_164": { calories: 143, protein: 3.3, carbs: 18.6, fat: 6 },
  "01_158": { calories: 157, protein: 3.9, carbs: 22, fat: 5.6 },
  "01_135": { calories: 115, protein: 2.3, carbs: 25.5, fat: 0.2 },
  "01_162": { calories: 173, protein: 3.8, carbs: 24.8, fat: 6.2 },
  "01_152": { calories: 138, protein: 3.1, carbs: 29.1, fat: 0.6 },
  "03_007": { calories: 122, protein: 8.5, carbs: 18.3, fat: 0.5 },
  "03_144": { calories: 177, protein: 7.2, carbs: 16.7, fat: 8.2 },
  "03_154": { calories: 253, protein: 12.6, carbs: 27.7, fat: 8.9 },
  "14_008": { calories: 166, protein: 6.6, carbs: 5.3, fat: 12.5 },
  "14_028": { calories: 203, protein: 6.3, carbs: 3.1, fat: 17.7 },
  "14_019": { calories: 74, protein: 3.4, carbs: 2.6, fat: 5.2 },
  "14_004": { calories: 168, protein: 6.7, carbs: 3.5, fat: 13.6 },
  "14_025": { calories: 264, protein: 6.4, carbs: 4.6, fat: 23.7 },
  "14_024": { calories: 96, protein: 2.7, carbs: 2.8, fat: 8 },
  "14_005": { calories: 127, protein: 5.7, carbs: 3.8, fat: 9.5 },
  "14_003": { calories: 195, protein: 7.2, carbs: 4.2, fat: 16.2 },
  "14_012": { calories: 81, protein: 5.4, carbs: 2.1, fat: 5.4 },
  "07_118": { calories: 152, protein: 30.7, carbs: 0, fat: 3.2 },
  "07_085": { calories: 185, protein: 31.7, carbs: 0, fat: 6.4 },
  "09_108": { calories: 121, protein: 19.9, carbs: 0, fat: 4.6 },
  "07_115": { calories: 202, protein: 33.6, carbs: 0, fat: 7.5 },
  "07_117": { calories: 136, protein: 27.6, carbs: 0, fat: 2.9 },
  "08_002": { calories: 150, protein: 13.5, carbs: 0.2, fat: 10.6 },
  "02_078": { calories: 136, protein: 1.9, carbs: 28.7, fat: 0.2 },
  "02_082": { calories: 262, protein: 3.6, carbs: 39.6, fat: 8 },
  "02_084": { calories: 375, protein: 2.1, carbs: 51.7, fat: 16.9 },
  "02_058": { calories: 137, protein: 1.3, carbs: 31.3, fat: 0.2 },
  "01_046": { calories: 249, protein: 7.5, carbs: 50.5, fat: 1.3 },
  "01_154": { calories: 48, protein: 0.9, carbs: 9.9, fat: 0.4 },
  "01_188": { calories: 479, protein: 6.2, carbs: 64.9, fat: 21.2 },
  "02_065": { calories: 151, protein: 1.8, carbs: 30.3, fat: 1.1 },
  "12_013": { calories: 34, protein: 0.3, carbs: 7.9, fat: 0.1 },
  "01_167": { calories: 62, protein: 1.2, carbs: 12.6, fat: 0.6 },
};

const NIGERIA_WAFCT_MAP = {
  "ng-eba": { code: "02_041", confidence: "proxy" },
  "ng-fufu": { code: "02_041", confidence: "proxy" },
  "ng-pounded-yam": { code: "02_097", confidence: "proxy" },
  "ng-semo": { code: "01_111", confidence: "proxy" },
  "ng-amala": { code: "02_097", confidence: "proxy" },

  "ng-jollof-rice": { code: "01_164", confidence: "proxy" },
  "ng-fried-rice": { code: "01_158", confidence: "proxy" },
  "ng-white-rice": { code: "01_135", confidence: "exact" },
  "ng-coconut-rice": { code: "01_162", confidence: "proxy" },
  "ng-ofada-rice": { code: "01_152", confidence: "proxy" },

  "ng-beans": { code: "03_007", confidence: "exact" },
  "ng-ewa-agoyin": { code: "03_144", confidence: "proxy" },
  "ng-moi-moi": { code: "03_007", confidence: "proxy" },
  "ng-akara": { code: "03_154", confidence: "proxy" },

  "ng-egusi": { code: "14_008", confidence: "proxy" },
  "ng-ogbono": { code: "14_028", confidence: "proxy" },
  "ng-okra": { code: "14_019", confidence: "proxy" },
  "ng-edikang-ikong": { code: "14_004", confidence: "proxy" },
  "ng-afang": { code: "14_025", confidence: "proxy" },
  "ng-banga": { code: "14_024", confidence: "proxy" },
  "ng-iro": { code: "14_005", confidence: "proxy" },
  "ng-tomato-stew": { code: "14_003", confidence: "proxy" },
  "ng-pepper-soup": { code: "14_012", confidence: "proxy" },

  "ng-chicken": { code: "07_118", confidence: "proxy" },
  "ng-beef": { code: "07_085", confidence: "exact" },
  "ng-fish": { code: "09_108", confidence: "proxy" },
  "ng-goat": { code: "07_115", confidence: "exact" },
  "ng-turkey": { code: "07_117", confidence: "proxy" },
  "ng-egg": { code: "08_002", confidence: "exact" },

  "ng-boiled-yam": { code: "02_078", confidence: "exact" },
  "ng-fried-yam": { code: "02_082", confidence: "exact" },
  "ng-plantain-fried": { code: "02_084", confidence: "exact" },
  "ng-plantain-boiled": { code: "02_058", confidence: "exact" },

  "ng-bread": { code: "01_046", confidence: "exact" },
  "ng-ogi": { code: "01_154", confidence: "proxy" },
  "ng-chin-chin": { code: "01_188", confidence: "proxy" },
  "ng-puff-puff": { code: "01_188", confidence: "proxy" },
  "ng-boli": { code: "02_065", confidence: "proxy" },

  "ng-zobo": { code: "12_013", confidence: "proxy" },
  "ng-kunu": { code: "01_167", confidence: "proxy" },
};

const FOODS = [
  // Staples / Swallow
  make("ng-eba", "Eba (Garri)", "Swallow", "1 wrap (300g)", 300, [
    "swallow",
  ]),
  make("ng-fufu", "Fufu", "Swallow", "1 wrap (300g)", 300, ["swallow"]),
  make("ng-pounded-yam", "Pounded Yam", "Swallow", "1 wrap (300g)", 300, [
    "swallow",
  ]),
  make("ng-semo", "Semovita", "Swallow", "1 wrap (300g)", 300, ["swallow"]),
  make("ng-amala", "Amala", "Swallow", "1 wrap (300g)", 300, ["swallow"]),

  // Rice / Grains
  make("ng-jollof-rice", "Jollof Rice", "Rice", "1 cup (200g)", 200, [
    "rice",
  ]),
  make("ng-fried-rice", "Fried Rice", "Rice", "1 cup (200g)", 200, ["rice"]),
  make("ng-white-rice", "White Rice", "Rice", "1 cup (200g)", 200, ["rice"]),
  make("ng-coconut-rice", "Coconut Rice", "Rice", "1 cup (200g)", 200, [
    "rice",
  ]),
  make("ng-ofada-rice", "Ofada Rice", "Rice", "1 cup (200g)", 200, ["rice"]),

  // Beans / Legumes
  make("ng-beans", "Boiled Beans", "Legume", "1 cup (200g)", 200, ["beans"]),
  make("ng-ewa-agoyin", "Ewa Agoyin", "Legume", "1 cup (200g)", 200, [
    "beans",
  ]),
  make("ng-moi-moi", "Moi Moi", "Legume", "1 wrap (200g)", 200, ["beans"]),
  make("ng-akara", "Akara", "Snack", "3 pieces (120g)", 120, ["beans"]),

  // Soups / Stews (1 ladle)
  make("ng-egusi", "Egusi Soup", "Soup", "1 ladle (150g)", 150, ["soup"]),
  make("ng-ogbono", "Ogbono Soup", "Soup", "1 ladle (150g)", 150, ["soup"]),
  make("ng-okra", "Okra Soup", "Soup", "1 ladle (150g)", 150, ["soup"]),
  make("ng-edikang-ikong", "Edikang Ikong", "Soup", "1 ladle (150g)", 150, [
    "soup",
  ]),
  make("ng-afang", "Afang Soup", "Soup", "1 ladle (150g)", 150, ["soup"]),
  make("ng-banga", "Banga Soup", "Soup", "1 ladle (150g)", 150, ["soup"]),
  make("ng-iro", "Iro/Ofada Stew", "Stew", "1 ladle (150g)", 150, ["stew"]),
  make("ng-tomato-stew", "Tomato Stew", "Stew", "1 ladle (150g)", 150, [
    "stew",
  ]),
  make("ng-pepper-soup", "Pepper Soup", "Soup", "1 bowl (300g)", 300, [
    "soup",
  ]),

  // Proteins (1 piece)
  make("ng-chicken", "Chicken (piece)", "Protein", "1 piece (120g)", 120, [
    "protein",
  ]),
  make("ng-beef", "Beef (piece)", "Protein", "1 piece (100g)", 100, [
    "protein",
  ]),
  make("ng-fish", "Fish (piece)", "Protein", "1 piece (120g)", 120, [
    "protein",
  ]),
  make("ng-goat", "Goat Meat (piece)", "Protein", "1 piece (100g)", 100, [
    "protein",
  ]),
  make("ng-turkey", "Turkey (piece)", "Protein", "1 piece (120g)", 120, [
    "protein",
  ]),
  make("ng-egg", "Boiled Egg", "Protein", "1 egg (50g)", 50, ["protein"]),

  // Tubers / Plantain
  make("ng-boiled-yam", "Boiled Yam", "Tubers", "1 slice (200g)", 200, [
    "yam",
  ]),
  make("ng-fried-yam", "Fried Yam", "Tubers", "1 slice (200g)", 200, ["yam"]),
  make("ng-plantain-fried", "Fried Plantain", "Side", "1 serving (150g)", 150, [
    "plantain",
  ]),
  make("ng-plantain-boiled", "Boiled Plantain", "Side", "1 serving (200g)", 200, [
    "plantain",
  ]),

  // Breakfast / Snacks
  make("ng-bread", "Bread", "Snack", "2 slices (60g)", 60, ["bread"]),
  make("ng-ogi", "Ogi (Pap)", "Drink", "1 cup (250g)", 250, ["pap"]),
  make("ng-chin-chin", "Chin Chin", "Snack", "1 cup (120g)", 120, ["snack"]),
  make("ng-puff-puff", "Puff Puff", "Snack", "3 pieces (120g)", 120, [
    "snack",
  ]),
  make("ng-boli", "Boli (Roasted Plantain)", "Snack", "1 piece (200g)", 200, [
    "plantain",
  ]),

  // Drinks
  make("ng-zobo", "Zobo", "Drink", "1 glass (300g)", 300, ["drink"]),
  make("ng-kunu", "Kunu", "Drink", "1 glass (300g)", 300, ["drink"]),
];

export default FOODS;
