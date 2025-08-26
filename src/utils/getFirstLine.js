import fs from "fs";
import readline from "readline";

/**
 * 
 * Pega a primeira linha de texto de um arquivo. 
 * Código pego {@link https://stackoverflow.com/questions/28747719/what-is-the-most-efficient-way-to-read-only-the-first-line-of-a-file-in-node-js#answer-60193465 daqui}.
 */
export default async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}