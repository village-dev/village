import main from "./main";

// read first argument
const args = process.argv.slice(2);

const result = main(args);

console.log(result);

process.exit(0);
