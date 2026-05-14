"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDirectory = resetDirectory;
exports.writeTextFile = writeTextFile;
exports.joinLines = joinLines;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
async function resetDirectory(directory) {
    await (0, promises_1.rm)(directory, { recursive: true, force: true });
    await (0, promises_1.mkdir)(directory, { recursive: true });
}
async function writeTextFile(filePath, content) {
    await (0, promises_1.mkdir)(path_1.default.dirname(filePath), { recursive: true });
    await (0, promises_1.writeFile)(filePath, content.trimStart(), 'utf8');
}
function joinLines(lines) {
    return `${lines.join('\n')}\n`;
}
//# sourceMappingURL=file-writer.js.map