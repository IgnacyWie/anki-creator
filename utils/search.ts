// This searches for image
// Fetches it and saves it and outputs path

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const IMAGE_FOLDER = "media/images";

const queryGoogleImages = async (keyword: string): Promise<string | null> => {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CX; // Add your search engine ID here

  const limit = 2;

  if (!apiKey || !cx) {
    console.error("API key or CX ID is missing");
    return null;
  }

  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    keyword
  )}&searchType=image&key=${apiKey}&cx=${cx}&num=${limit}`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    console.log(data)

    if (!data.items || data.items.length === 0) {
      console.error("No image results found");
      return null;
    }

    const imageUrl = data.items[0].link;
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();

    const fileName = `${keyword.replace(/\s+/g, "_")}_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '../', IMAGE_FOLDER, fileName);

    fs.writeFileSync(filePath, buffer);

    console.log(`Image saved at ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error during image search and save:", error);
    return null;
  }
};

export { queryGoogleImages };
