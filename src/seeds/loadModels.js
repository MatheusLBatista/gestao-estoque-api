// /src/seeds/loadModels.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtém o diretório atual do arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Função para ler automaticamente os models da pasta "../models".
 * Retorna um array com objetos { model, name }.
 */
async function loadModels() {
    const models = [];
    const modelsDir = path.join(__dirname, '../models');
    const files = fs.readdirSync(modelsDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const modelPath = path.join(modelsDir, file);
            // Importação dinâmica do módulo
            const module = await import(modelPath);
            // Considera que o model está exportado como default
            const model = module.default || module;
            // Usa o nome do arquivo (sem extensão) como identificador
            const modelName = path.basename(file, '.js');
            models.push({ model, name: modelName });
        }
    }
    return models;
}

export default loadModels;


