exports.getDate = (date) => {
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

exports.calcDate = function (postedDate) {
  const today = new Date()
  const diff = Math.floor(today.getTime() - postedDate.getTime());
  const day = 1000 * 60 * 60 * 24;

  const days = Math.floor(diff / day);
  const months = Math.floor(days / 31);
  const years = Math.floor(months / 12);

  if (years > 0) {
    if (years == 1) return "1 year";
    return years + " years"
  }
  if (months > 5) {
    if (months == 1) return "1 year";
    return months + " months"
  }
  let options = {
    month: "short",
    day: "numeric",
  };
  return postedDate.toLocaleDateString("en-US", options);
}