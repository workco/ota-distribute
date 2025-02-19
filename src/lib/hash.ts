// From https://gist.github.com/bishil06/6c3a060b33f551ee9acc03188f964dcc

import fs from "node:fs";
import crypto from "crypto";

/**
 * Computes the MD5 hash of a file specified by its path.
 *
 * This function reads the file in chunks and updates the MD5 hash incrementally.
 * It throws an error if the file does not exist, if the provided path is a directory, or if the file is not readable.
 *
 * @param filePath - The path to the file for which to compute the MD5 hash. This can be a string or a Buffer.
 * @returns A promise that resolves to the MD5 hash of the file as a hexadecimal string.
 * @throws Throws an error if the file does not exist, if the path is a directory, or if the file is not readable.
 *
 * @example Example usage of createMD5 function
 * (async () => {
 *     try {
 *         const hash = await createMD5("path/to/file.txt");
 *         console.log(`MD5 Hash: ${hash}`);
 *     } catch (error) {
 *         console.error(error.message);
 *     }
 * })();
 */
export const createMD5 = async (filePath: fs.PathLike): Promise<string> => {
  // Check if the file exists at the specified path
  if (!fs.existsSync(filePath))
    throw new Error(
      `The specified file "${filePath}" does not exist. Please check the path and try again.`,
    );

  // Check if the specified path is a directory
  if (fs.statSync(filePath).isDirectory())
    throw new Error(
      `The path "${filePath}" points to a directory, not a file. Please provide a valid file path.`,
    );

  // Check if the file is readable
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch {
    throw new Error(
      `The file "${filePath}" is not readable. Please check your permissions.`,
    );
  }

  // Create an MD5 hash object
  const hash = crypto.createHash("md5");
  // Create a read stream for the file
  const rStream = fs.createReadStream(filePath);

  // Read the file in chunks
  let data = "";
  for await (const chunk of rStream) data += chunk;

  // Update the hash with data
  hash.update(data);

  // Return the final hash as a hexadecimal string
  return hash.digest("hex");
};
