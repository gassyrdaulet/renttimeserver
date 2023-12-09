import sizeOf from "image-size";
import sharp from "sharp";
import fs from "fs/promises";

const directoryPath = "./images/";

async function directoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
    return true;
  } catch (error) {
    return false;
  }
}

export const getImageResolution = (imageBuffer) => {
  try {
    const dimensions = sizeOf(imageBuffer);
    return {
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch {
    throw new Error("Error reading image dimensions");
  }
};

export async function createThumbnailFromBuffer(buffer, filename, height, id) {
  try {
    if (!(await directoryExists(directoryPath + id))) {
      await fs.mkdir(directoryPath + id, { recursive: true });
    }
    await sharp(buffer)
      .resize(null, height)
      .jpeg(50)
      .toFile(directoryPath + `${id}/` + filename + ".jpeg");
  } catch (error) {
    throw new Error("Error creating thumbnail");
  }
}

export async function saveFromBuffer(buffer, filename, id) {
  try {
    if (!(await directoryExists(directoryPath + id))) {
      await fs.mkdir(directoryPath + id, { recursive: true });
    }
    await sharp(buffer)
      .jpeg(50)
      .toFile(directoryPath + `${id}/` + filename + ".jpeg");
  } catch (error) {
    throw new Error("Error saving from buffer");
  }
}

export async function deleteImagesByProductID(uniqueCode, id) {
  try {
    if (!(await directoryExists(directoryPath + id))) {
      await fs.mkdir(directoryPath + id, { recursive: true });
    }
    const files = await fs.readdir(directoryPath + id);
    const targetFiles = files.filter((file) => {
      const fileName = file.toLowerCase();
      return fileName.includes(uniqueCode);
    });
    await Promise.all(
      targetFiles.map(async (file) => {
        const filePath = `${directoryPath}${id}/${file}`;
        await fs.unlink(filePath);
      })
    );
  } catch (error) {
    console.error("Error deleting files:", error);
  }
}
