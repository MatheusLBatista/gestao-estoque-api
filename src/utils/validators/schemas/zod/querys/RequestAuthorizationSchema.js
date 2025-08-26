import { z } from "zod";

/** Body esperado para a requisição de autorização
  {
    "accesstoken": "string",
    "refreshtoken": "string", //opcional
    "domain": "string",
    "path": "string",
    "metodo": "string",
    "query": "string",
    "params": {},
    "body": {}
  }
*/

const RequestAuthorizationSchema = z.object({
    accesstoken: z.string()
        .min(1, "Accesstoken não pode ser vazio")
        .refine(val => val.trim().toLowerCase() !== "null", {
            message: "Accesstoken inválido"
        })
        .transform((val) => val.trim()),

    // refreshtoken: z.string()
    //     .optional()
    //     .refine((val) => !val || val.trim().length > 0, {
    //         message: "Refreshtoken não pode ser vazio",
    //     })
    //     .transform((val) => val?.trim()),

    // domain: z.string()
    //     .min(1, "Domain não pode ser vazio")
    //     .transform((val) => val.trim()),

    // path: z.string()
    //     .min(1, "Path não pode ser vazio")
    //     .transform((val) => val.trim()),

    // metodo: z.string()
    //     .min(1, "Metodo não pode ser vazio")
    //     .transform((val) => val.trim()),

    // query: z.string()
    //     .optional()
    //     .refine((val) => !val || val.trim().length > 0, {
    //         message: "Query não pode ser vazio",
    //     })
    //     .transform((val) => val?.trim()),

    // params: z.record(z.any())
    //     .optional()
    //     .refine((val) => !val || Object.keys(val).length > 0, {
    //         message: "Params não pode ser vazio",
    //     }),

    // body: z.record(z.any())
    //     .optional()
    //     .refine((val) => !val || Object.keys(val).length > 0, {
    //         message: "Body não pode ser vazio",
    //     }),
}).passthrough();

const RequestAuthorizationUpdateSchema = RequestAuthorizationSchema.partial();

export { RequestAuthorizationSchema, RequestAuthorizationUpdateSchema };