// 공통 유틸 함수들
export const convertMealType = (mealType) => {
  const typeMap = {
    BREAKFAST: "아침",
    LUNCH: "점심",
    DINNER: "저녁",
    SNACK: "간식",
  };
  return typeMap[mealType] || mealType;
};

export const calculateNutritionFromFoods = (foods) => {
  if (!foods || !Array.isArray(foods)) {
    return { calories: 0, carbs: 0, protein: 0, fat: 0 };
  }

  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + (food.calories || 0),
      carbs: totals.carbs + (food.carbohydrate || 0),
      protein: totals.protein + (food.protein || 0),
      fat: totals.fat + (food.fat || 0),
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );
};

export const transformMealRecord = (record) => {
  const { calories, carbs, protein, fat } = calculateNutritionFromFoods(
    record.foods
  );

  const finalCalories = record.totalKcal || record.calories || calories;
  const finalCarbs = record.totalCarbs || carbs;
  const finalProtein = record.totalProtein || protein;
  const finalFat = record.totalFat || fat;

  const dateField =
    record.modifiedAt || record.createDate || record.createdDate || record.date;

  return {
    ...record,
    type: convertMealType(record.mealType),
    createDate: dateField,
    modifiedAt: record.modifiedAt,
    totalKcal: finalCalories,
    calories: finalCalories,
    totalCarbs: finalCarbs,
    carbs: finalCarbs,
    totalProtein: finalProtein,
    totalFat: finalFat,
    mealId: record.id || record.mealId,
  };
};

export const calculateTotalNutrition = (records) => {
  return records.reduce(
    (totals, record) => ({
      totalKcal: totals.totalKcal + (record.totalKcal || 0),
      totalCarbs: totals.totalCarbs + (record.totalCarbs || 0),
      totalProtein: totals.totalProtein + (record.totalProtein || 0),
      totalFat: totals.totalFat + (record.totalFat || 0),
    }),
    { totalKcal: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0 }
  );
};
