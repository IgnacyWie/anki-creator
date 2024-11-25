import { queryGoogleImages } from "./utils/search";
import { queryPronounciation } from "./utils/pronounciation";
import { queryContext } from "./utils/context";
import AnkiExport from "anki-apkg-export";
import { promises as fs } from "fs";
import path from "path";

const inputPath = "./output.json";
const DECK_NAME = "Dutch Vocabulary";

async function createAnkiDeck() {
  // Create Anki export instance
  const apkg = new AnkiExport(DECK_NAME);

  // Read and parse input file
  const content = await fs.readFile(inputPath, "utf-8");
  const words = JSON.parse(content).splice(0, 200);

  // Process each word
  for (const word of words) {
    try {
      console.log(`Processing word: ${word.word}`);

      // Get context, image, and pronunciation
      const [context, imagePath, audioPath] = await Promise.all([
        queryContext(word.word),
        queryGoogleImages(word.translation),
        queryPronounciation(word.word),
      ]);

      // Add media files if they exist
      if (imagePath) {
        const imageContent = await fs.readFile(imagePath);
        const imageFileName = path.basename(imagePath);
        apkg.addMedia(imageFileName, imageContent);
      }

      if (audioPath) {
        const audioContent = await fs.readFile(audioPath);
        const audioFileName = path.basename(audioPath);
        apkg.addMedia(audioFileName, audioContent);
      }

      // Create front and back of the card
      const front = createFrontTemplate(word, context, imagePath, audioPath);
      const back = createBackTemplate(word, context);

      // Add card to deck
      apkg.addCard(front, back, { tags: ["dutch", "vocabulary"] });
    } catch (error) {
      console.error(`Error processing word ${word.word}:`, error);
    }
  }

  // Save the deck
  const zip = await apkg.save();
  await fs.writeFile("./dutch_vocabulary.apkg", zip, "binary");
  console.log("Anki deck has been generated: dutch_vocabulary.apkg");
}

function createFrontTemplate(
  word: { word: string },
  context: { source: string; target: string } | undefined,
  imagePath: string | null,
  audioPath: string | null
): string {
  let template = `<div style="text-align: center; font-size: 2em;">${word.word}</div>`;

  if (context) {
    template += `
<div style="margin-top: 20px; padding: 10px; background-color: #333; border-radius: 5px;">
    <div style="color: #ffcc00; font-weight: bold;">${context.source}</div>
</div>
    `;
  }

  if (audioPath) {
    const audioFileName = path.basename(audioPath);
    template += `\n[sound:${audioFileName}]`;
  }

  if (imagePath) {
    const imageFileName = path.basename(imagePath);
    template += `\n<div><img src="${imageFileName}" style="max-width: 300px;"></div>`;
  }

  return template;
}

function createBackTemplate(
  word: { translation: string },
  context: { source: string; target: string } | undefined
): string {
  let template = `<div style="text-align: center; font-size: 2em;">${word.translation}</div>`;

  if (context) {
    template += `
<div style="margin-top: 20px; padding: 10px; background-color: #333; border-radius: 5px;">
    <div style="color: #ffcc00; font-weight: bold;">${context.source}</div>
    <div style="margin-top: 5px; color: #ffffff;">${context.target}</div>
</div>

    `;
  }

  return template;
}

// Run the script
createAnkiDeck().catch(console.error);
