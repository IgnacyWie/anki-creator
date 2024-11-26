import AnkiExport from "anki-apkg-export";
import { promises as fs } from "fs";
import path from "path";

const outputPath = "./output.json";
const DECK_NAME = "Dutch Vocabulary";

async function createAnkiDeck() {
  // Create Anki export instance
  const apkg = new AnkiExport(DECK_NAME);

  // Read and parse output file
  const content = await fs.readFile(outputPath, "utf-8");
  const words = JSON.parse(content);

  for (const word of words) {
    try {
      console.log(`Adding word to deck: ${word.word}`);

      // Add media files if they exist
      if (word.imagePath) {
        const imageContent = await fs.readFile(word.imagePath);
        const imageFileName = path.basename(word.imagePath);
        apkg.addMedia(imageFileName, imageContent);
      }

      if (word.audioPath) {
        const audioContent = await fs.readFile(word.audioPath);
        const audioFileName = path.basename(word.audioPath);
        apkg.addMedia(audioFileName, audioContent);
      }

      // Create front and back of the card
      const front = createFrontTemplate(word);
      const back = createBackTemplate(word);

      // Add card to deck
      apkg.addCard(front, back, { tags: ["dutch", "vocabulary"] });
    } catch (error) {
      console.error(`Error adding word ${word.word} to deck:`, error);
    }
  }

  // Save the deck
  const zip = await apkg.save();
  await fs.writeFile("./dutch_vocabulary.apkg", zip, "binary");
  console.log("Anki deck has been generated: dutch_vocabulary.apkg");
}

function createFrontTemplate(word) {
  let template = `<div style="text-align: center; font-size: 2em;">${word.word}</div>`;

  if (word.context) {
    template += `
<div style="margin-top: 20px; padding: 10px; background-color: #333; border-radius: 5px;">
    <div style="color: #ffcc00; font-weight: bold;">${word.context.source}</div>
</div>
    `;
  }

  if (word.audioPath) {
    const audioFileName = path.basename(word.audioPath);
    template += `\n[sound:${audioFileName}]`;
  }

  if (word.imagePath) {
    const imageFileName = path.basename(word.imagePath);
    template += `\n<div><img src="${imageFileName}" style="max-width: 300px;"></div>`;
  }

  return template;
}

function createBackTemplate(word) {
  let template = `<div style="text-align: center; font-size: 2em;">${word.translation}</div>`;

  if (word.context) {
    template += `
<div style="margin-top: 20px; padding: 10px; background-color: #333; border-radius: 5px;">
    <div style="color: #ffcc00; font-weight: bold;">${word.context.source}</div>
    <div style="margin-top: 5px; color: #ffffff;">${word.context.target}</div>
</div>
    `;
  }

  return template;
}

// Run the Anki deck creation script
createAnkiDeck().catch(console.error);

