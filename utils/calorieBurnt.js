export function estimateStepCount(distanceM, heightCM, gender) {
  if (!heightCM || !gender || typeof gender !== "string") return 0;

  const heightM = heightCM / 100;
  const genderLower = gender.toLowerCase();
  const stepLength = heightM * (genderLower === "male" ? 0.415 : 0.413);

  return Math.round(distanceM / stepLength);
}

export function estimateCaloriesBurnt(steps, weightKG) {
  return Math.round(steps * weightKG * 0.0005);
}
