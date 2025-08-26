import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
// import Rota from '../../models/Rota.js';
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir do schema do modelo Rota
const rotaJsonSchema = Rota.schema.jsonSchema();

// Remove o campo __v da representação original, se existir
delete rotaJsonSchema.properties.__v;

// Compondo os diferentes contratos da API utilizando cópias profundas do schema gerado
const rotasSchemas = {
  RotaFiltro: {
    type: "object",
    properties: {
      rota: rotaJsonSchema.properties.rota,
      descricao: rotaJsonSchema.properties.descricao,
      ativo: rotaJsonSchema.properties.ativo,
    }
  },
  RotaListagem: {
    ...deepCopy(rotaJsonSchema),
    required: [],
    description: "Schema para listagem de rotas"
  },
  RotaDetalhes: {
    ...deepCopy(rotaJsonSchema),
    required: [],
    description: "Schema para detalhes de uma rota"
  },
  RotaPost: {
    ...deepCopy(rotaJsonSchema),
    required: ["rota", "dominio"],
    description: "Schema para criação de rota"
  },
  RotaPostResposta: {
    ...deepCopy(rotaJsonSchema),
    required: [],
    description: "Schema de resposta para criação de rota"
  },
  RotaPutPatch: {
    ...deepCopy(rotaJsonSchema),
    required: [],
    description: "Schema para atualização de rota"
  },
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  RotaListagem: ['createdAt', 'updatedAt', '__v'],
  RotaDetalhes: ['createdAt', 'updatedAt', '__v'],
  RotaPost: ['createdAt', 'updatedAt', '__v', '_id'],
  RotaPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
  RotaPostResposta: ['createdAt', 'updatedAt', '__v'],
};

// Aplica a remoção de campos conforme o mapping definido
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (rotasSchemas[schemaKey]) {
    removeFieldsRecursively(rotasSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detecção automática de referências
const rotaMongooseSchema = Rota.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para referência
rotasSchemas.RotaListagem.example = await generateExample(rotasSchemas.RotaListagem, null, rotaMongooseSchema);
rotasSchemas.RotaDetalhes.example = await generateExample(rotasSchemas.RotaDetalhes, null, rotaMongooseSchema);
rotasSchemas.RotaPost.example = await generateExample(rotasSchemas.RotaPost, null, rotaMongooseSchema);
rotasSchemas.RotaPutPatch.example = await generateExample(rotasSchemas.RotaPutPatch, null, rotaMongooseSchema);
rotasSchemas.RotaPostResposta.example = await generateExample(rotasSchemas.RotaPostResposta, null, rotaMongooseSchema);

export default rotasSchemas;
