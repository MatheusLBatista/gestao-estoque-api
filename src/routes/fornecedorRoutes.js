import express from "express";
import { asyncWrapper } from "../utils/helpers/index.js";
import FornecedorController from "../controllers/FornecedorController.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";

const router = express.Router();
const fornecedorController = new FornecedorController();

router
  .get(
    "/",
    LogMiddleware.log("CONSULTA_FORNECEDORES"),
    asyncWrapper(fornecedorController.listar.bind(fornecedorController))
  )
  
  .get(
    "/:id",
    LogMiddleware.log("CONSULTA_FORNECEDOR"),
    asyncWrapper(fornecedorController.buscarPorId.bind(fornecedorController))
  )
  
  .post(
    "/",
    LogMiddleware.log("CADASTRO_FORNECEDOR"),
    asyncWrapper(fornecedorController.criar.bind(fornecedorController))
  )
  
  .patch(
    "/:id",
    LogMiddleware.log("ATUALIZACAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.atualizar.bind(fornecedorController))
  )
  
  .delete(
    "/:id",
    LogMiddleware.log("EXCLUSAO_FORNECEDOR"),
    asyncWrapper(fornecedorController.deletar.bind(fornecedorController))
  )
  
  .patch(
    "/desativar/:id",
    LogMiddleware.log("DESATIVACAO_FORNECEDOR"),
    asyncWrapper(
      fornecedorController.desativarFornecedor.bind(fornecedorController)
    )
  )
  
  .patch(
    "/reativar/:id",
    LogMiddleware.log("REATIVACAO_FORNECEDOR"),
    asyncWrapper(
      fornecedorController.reativarFornecedor.bind(fornecedorController)
    )
  );

export default router;
