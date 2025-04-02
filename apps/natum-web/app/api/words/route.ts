import { readFileSync } from "node:fs";

const initialize = () => {
  try {
    const textFile = readFileSync(
      "public/typo-meter/word-collections/common.json",
      "utf8"
    );

    return JSON.parse(textFile).commonWords;
  } catch (err) {
    console.error("Failed to initialize word collection, error: " + err);
    throw err;
  }
};

// Read words from word collections
const words = initialize();

// Get top 1000 randomized words
export const GET = () => {
  return Response.json(words);
};
