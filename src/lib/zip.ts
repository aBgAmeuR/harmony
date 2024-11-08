import { strFromU8, unzip, Unzipped } from "fflate";

/**
 * Extracts relevant JSON files from a provided ZIP buffer.
 * @param arrayBuffer The ArrayBuffer of the ZIP file.
 * @param filesRegexPattern The regex pattern to match the files to extract.
 * @returns A promise that resolves to an array of objects containing filenames and file content.
 */
export async function extractZipAndGetFiles(
  arrayBuffer: ArrayBuffer,
  filesRegexPattern: RegExp
): Promise<{ filename: string; content: Uint8Array }[]> {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(arrayBuffer), (err, unzipped: Unzipped) => {
      if (err) {
        return reject(new Error("Failed to unzip the file"));
      }

      const files: { filename: string; content: Uint8Array }[] = [];
      for (const filename in unzipped) {
        if (filesRegexPattern.test(filename)) {
          files.push({ filename, content: unzipped[filename] });
        }
      }

      if (files.length === 0) {
        reject(new Error("No valid files found in the zip"));
      } else {
        resolve(files);
      }
    });
  });
}

/**
 * Converts the extracted files' contents to an array of JSON objects.
 * @param files Array of objects with filenames and content as Uint8Array.
 * @returns An array of parsed JSON objects.
 */
export function parseZipFiles<T>(
  files: { filename: string; content: Uint8Array }[]
): T[][] {
  const data: T[][] = [];

  for (const file of files) {
    const contentStr = strFromU8(file.content);
    try {
      const jsonData = JSON.parse(contentStr) as T[];
      data.push(jsonData);
    } catch (error) {
      console.error(`Failed to parse JSON from file: ${file.filename}`, error);
    }
  }

  return data;
}
