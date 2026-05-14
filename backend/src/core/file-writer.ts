import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';

export async function resetDirectory(directory: string): Promise<void> {
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content.trimStart(), 'utf8');
}

export function joinLines(lines: string[]): string {
  return `${lines.join('\n')}\n`;
}
