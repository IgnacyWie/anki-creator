
// This searches for image
// Fetches it and saves it and outputs path

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const AUDIO_FOLDER = "media/audio";

const queryPronounciation = async (keyword: string): Promise<string | null> => {
  try {
    // Construct the Forvo API URL
    const language_code = process.env.LANGUAGE_CODE?.toLowerCase();
    const url = `https://apifree.forvo.com/key/${process.env.FORVO_API_KEY}/format/json/action/standard-pronunciation/word/${encodeURIComponent(keyword)}/language/${language_code}`;

    // Fetch the API response
    const response = await fetch(url);


    if (!response.ok) {
      console.log(response)
      console.error(`Error fetching data from Forvo API: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Check if there are pronunciations available
    if (!data.items || data.items.length === 0) {
      console.error("No pronunciations found for the keyword.");
      return null;
    }

    // Get the URL of the first pronunciation audio
    const audioUrl = data.items[0].pathmp3;
    if (!audioUrl) {
      console.error("Audio URL not found.");
      return null;
    }

    // Ensure the AUDIO_FOLDER exists
    if (!fs.existsSync(AUDIO_FOLDER)) {
      fs.mkdirSync(AUDIO_FOLDER, { recursive: true });
    }

    // Define the local file path to save the audio
    const fileName = `${keyword.replace(/\s+/g, "_")}.mp3`;
    const filePath = path.join(__dirname, '../', AUDIO_FOLDER, fileName);

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.error(`Error fetching audio file: ${audioResponse.statusText}`);
      return null;
    }

    // Save the audio file locally
    const audioBuffer = await audioResponse.buffer();
    fs.writeFileSync(filePath, audioBuffer);

    console.log(`Audio saved at: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error in queryPronounciation: ${error.message}`);
    return null;
  }
};

export { queryPronounciation };
