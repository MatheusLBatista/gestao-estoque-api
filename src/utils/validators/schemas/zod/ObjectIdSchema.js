// src/utils/validators/schemas/zod/objectIdSchema.js

import { z } from 'zod';

// Expressão regular para validar ObjectId do MongoDB (24 caracteres hexadecimais)
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export default objectIdSchema;
