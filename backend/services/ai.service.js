/**
 * Mock AI Service for Categorization Placeholder
 */
export const suggestCategory = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("food") || lowerDesc.includes("mess")) return "mess";
  if (lowerDesc.includes("stay") || lowerDesc.includes("hostel") || lowerDesc.includes("room")) return "hostel";
  if (lowerDesc.includes("computer") || lowerDesc.includes("pc") || lowerDesc.includes("lab")) return "lab";
  if (lowerDesc.includes("build") || lowerDesc.includes("bench") || lowerDesc.includes("road")) return "infra";
  return "other";
};
