// Format ISO date to readable format like "Jan 1, 2024"
export const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
