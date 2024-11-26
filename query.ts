import { queryGoogleImages } from "./utils/search";
import { queryPronounciation } from "./utils/pronounciation";
import { queryContext } from "./utils/context";
import { promises as fs } from "fs";

const inputPath = "./input.json";
const outputPath = "./output.json";

async function queryData() {
  // Read and parse input file
  const content = await fs.readFile(inputPath, "utf-8");
  const words = JSON.parse(content);

  const results = [];

  for (const word of words) {
    try {
      console.log(`Querying data for word: ${word.word}`);
      const [context, imagePath, audioPath] = await Promise.all([
        queryContext(word.word),
        queryGoogleImages(word.translation),
        queryPronounciation(word.word),
      ]);

      results.push({
        word: word.word,
        translation: word.translation,
        context,
        imagePath,
        audioPath,
      });
    } catch (error) {
      console.error(`Error querying data for word ${word.word}:`, error);
    }
  }

  // Write results to output JSON
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Data has been written to ${outputPath}`);
}

// Run the querying script
queryData().catch(console.error);
