const luxon = require("luxon");

console.log(
  "Time:",
  luxon.DateTime.now()
    .setZone("America/New_York")
    .minus({ weeks: 1 })
    .endOf("day")
    .toISO()
);
