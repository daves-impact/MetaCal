export const computeBmi = (weightKg, heightCm) => {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h) return null;
  const meters = h / 100;
  if (!meters) return null;
  return Number((w / (meters * meters)).toFixed(1));
};

export const bmiCategory = (bmi) => {
  if (bmi == null) return { label: "—", color: "#9CA3AF" };
  if (bmi < 16) return { label: "Very severely underweight", color: "#3B82F6" };
  if (bmi < 17) return { label: "Severely underweight", color: "#60A5FA" };
  if (bmi < 18.5) return { label: "Underweight", color: "#93C5FD" };
  if (bmi < 25) return { label: "Normal", color: "#22C55E" };
  if (bmi < 30) return { label: "Overweight", color: "#F59E0B" };
  if (bmi < 35) return { label: "Obese Class I", color: "#F97316" };
  if (bmi < 40) return { label: "Obese Class II", color: "#EF4444" };
  return { label: "Obese Class III", color: "#B91C1C" };
};
