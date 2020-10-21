import { markdownToDelta } from "./markdown-to-delta";

export const raceToDelta = (race) => {
  const ops = [];
  ops.push(...markdownToDelta(race.desc));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.asi_desc));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.age));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.alignment));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.size));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.speed_desc));
  ops.push({ insert: "\n" });
  ops.push(...markdownToDelta(race.languages));
  ops.push({ insert: "\n" });
  if (race.vision) {
    ops.push(...markdownToDelta(race.vision));
    ops.push({ insert: "\n" });
  }
  if (race.traits) {
    ops.push(...markdownToDelta(race.traits));
    ops.push({ insert: "\n" });
  }
  if (race.subraces.length > 0) {
    ops.push(
      { insert: "\n" },
      { insert: "Subraces", attributes: { size: "large" } },
      { insert: "\n" }
    );
  }
  for (let subrace of race.subraces) {
    ops.push(
      { insert: "\n" },
      { insert: subrace.name, attributes: { size: "large" } },
      { insert: "\n" },
      { insert: "\n" }
    );
    ops.push(...markdownToDelta(subrace.desc));
    ops.push({ insert: "\n" });
    ops.push(...markdownToDelta(subrace.asi_desc));
    ops.push({ insert: "\n" });
    ops.push(...markdownToDelta(subrace.traits));
  }

  return ops;
};
