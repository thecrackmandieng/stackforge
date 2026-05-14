"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const generator_1 = require("./core/generator");
const app = (0, express_1.default)();
const corsOrigin = process.env.CORS_ORIGIN;
app.use((0, cors_1.default)({
    origin: corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : true
}));
app.use(express_1.default.json({ limit: '5mb' }));
app.get('/', (req, res) => {
    res.json({
        status: true,
        service: 'StackForge Studio API'
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: true,
        service: 'StackForge Studio API'
    });
});
app.get('/generations', async (req, res, next) => {
    try {
        res.json(await (0, generator_1.listGeneratedProjects)());
    }
    catch (error) {
        next(error);
    }
});
app.get('/generations/:jobId', async (req, res, next) => {
    try {
        res.json(await (0, generator_1.readGeneratedProjectManifest)(req.params.jobId));
    }
    catch (error) {
        next(error);
    }
});
app.post('/generate', async (req, res, next) => {
    try {
        const result = await (0, generator_1.generateProject)(req.body);
        res.json({
            status: true,
            message: 'Projet genere avec succes.',
            ...result
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/download/:jobId/:fileName', (req, res) => {
    const zipPath = (0, generator_1.getZipPath)(req.params.jobId, req.params.fileName);
    if (!(0, fs_1.existsSync)(zipPath)) {
        return res.status(404).json({ message: 'Archive introuvable.' });
    }
    res.download(zipPath, path_1.default.basename(zipPath));
});
app.use((error, req, res, next) => {
    console.error(error);
    res.status(400).json({
        status: false,
        message: error.message || 'Generation impossible.'
    });
});
const PORT = Number(process.env.PORT || 3001);
exports.server = app.listen(PORT, () => {
    console.log(`StackForge Studio API running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map