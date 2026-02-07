function clamp(x, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(x)));
}

function computePriority({
  food_type,
  hours_since_prepared = 0,
  storage = "room_temp",
  quantity = 1
}) {
  let score = 0;

  // Food type importance
  const foodWeights = {
    cooked: 40,
    dairy: 35,
    bakery: 25,
    fruits: 20,
    raw: 15,
    packaged: 5
  };
  score += foodWeights[food_type] || 10;

  // Time factor
  score += Math.min(30, hours_since_prepared * 3);

  // Storage condition
  if (storage === "room_temp") score += 20;
  if (storage === "refrigerated") score -= 10;
  if (storage === "frozen") score -= 25;

  // Quantity factor
  score += Math.min(10, quantity * 0.5);

  return clamp(score);
}

module.exports = { computePriority };
