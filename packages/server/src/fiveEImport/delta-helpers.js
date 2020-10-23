export const getHeading = (title, newLine) => {
  const ops = [
    { insert: "\n" },
    { insert: "\n" },
    { insert: title, attributes: { size: "large" } },
  ];
  if (newLine) {
    ops.push({ insert: "\n" }, { insert: "\n" });
  }
  return ops;
};
export const getSubHeading = (title, newLine) => {
  const ops = [
    { insert: "\n" },
    { insert: "\n" },
    { insert: title + ": ", attributes: { bold: true, italic: true } },
  ];
  if (newLine) {
    ops.push({ insert: "\n" }, { insert: "\n" });
  }
  return ops;
};
