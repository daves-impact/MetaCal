export const computeTargets = (user) => {
  const weight = Number(user?.currentWeight || 70);
  const height = Number(user?.height || 170);
  const age = Number(user?.age || 25);
  const gender = String(user?.gender || "").toLowerCase();
  const isFemale = gender.includes("female");
  const bmr = 10 * weight + 6.25 * height - 5 * age + (isFemale ? -161 : 5);
  const activity = user?.activityLevel?.multiplier || 1.55;
  const tdee = bmr * activity;
  let adjust = 0;
  if (user?.goal === "lose") adjust = -300;
  if (user?.goal === "gain") adjust = 300;
  const calories = Math.max(1200, Math.round(tdee + adjust));
  const protein = Math.round(1.6 * weight);
  const fat = Math.round(0.8 * weight);
  const carbCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbCalories / 4));
  return { calories, protein, carbs, fat };
};
