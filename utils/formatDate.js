export const formatDate = (dateString, format) => {
  const date = new Date(dateString);
  switch (format) {
    case "day":
      return date.getDate().toString();
    case "month":
      return date.toLocaleString("default", { month: "long" });
    case "weekday":
      return date.toLocaleString("default", { weekday: "long" });
    case "year":
      return date.getFullYear().toString();
  }
};
