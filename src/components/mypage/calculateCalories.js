/**
 * Calculates recommended daily calories based on user input.
 * @param {Object} param0 - User data
 * @param {string} param0.birthAt - Birth date string (YYYY-MM-DD)
 * @param {string} param0.gender - '남성' | '여성' | 'MALE' | 'FEMALE'
 * @param {string|number} param0.height - Height in cm
 * @param {string|number} param0.weight - Weight in kg
 * @param {string} param0.activityLevel - Activity level string
 * @returns {number} - Calculated calories rounded to nearest int
 */
export default function calculateCalories({
  birthAt,
  gender,
  height,
  weight,
  activityLevel,
}) {
  // Check if all required parameters are provided
  console.log("calculateCalories input:", {
    birthAt,
    gender,
    height,
    weight,
    activityLevel,
  });

  if (!birthAt || !gender || !height || !weight || !activityLevel) {
    console.warn("calculateCalories: Missing required parameters", {
      birthAt,
      gender,
      height,
      weight,
      activityLevel,
    });
    return null;
  }

  const birthDate = new Date(birthAt);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  const h = parseFloat(height);
  const w = parseFloat(weight);
  let bmr;
  if (gender === "남성" || gender === "MALE") {
    bmr = 10 * w + 6.25 * h - 5 * age + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * age - 161;
  }

  let activityFactor = 1.55;
  if (activityLevel === "조금 활동적" || activityLevel === "LOW") {
    activityFactor = 1.375;
  } else if (activityLevel === "매우 활동적" || activityLevel === "HIGH") {
    activityFactor = 1.725;
  }

  const result = Math.round(bmr * activityFactor);
  console.log("calculateCalories result:", {
    age,
    bmr,
    activityFactor,
    result,
  });
  return result;
}
