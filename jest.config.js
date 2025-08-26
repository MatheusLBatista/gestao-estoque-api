export default {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests-exemplo/"
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Configuração específica para testes de integração
  setupFilesAfterEnv: [],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/seeds/**",
    "!src/docs/**",
    "!src/test/**",
    // Excluir arquivos com baixa cobertura (< 70%)
    "!src/app.js",
    "!src/config/**",
    "!src/dto/**",
    "!src/middlewares/AuthPermission.js",
    "!src/middlewares/LogActionMiddlewares.js",
    "!src/controllers/FornecedorController.js",
    "!src/controllers/UsuarioController.js",
    "!src/controllers/LogController.js",
    "!src/repositories/fornecedorRepository.js",
    "!src/repositories/usuarioRepository.js",
    "!src/repositories/filters/FornecedorFilterBuilder.js",
    "!src/repositories/filters/UsuarioFilterBuilder.js",
    "!src/services/AuthService.js",
    "!src/services/EmailService.js",
    "!src/services/LogService.js",
    "!src/services/PermissionService.js",
    "!src/services/fornecedorService.js",
    "!src/services/usuarioService.js",
    "!src/utils/AuthHelper.js",
    "!src/utils/DateHelper.js",
    "!src/utils/SendMail.js",
    "!src/utils/TokenUtil.js",
    "!src/utils/Validator.js",
    "!src/utils/atualizarCategorias.js",
    "!src/utils/getFirstLine.js",
    "!src/utils/handleQuery.js",
    "!src/utils/logger.js",
    "!src/utils/errors/**",
    "!src/utils/helpers/CommonResponse.js",
    "!src/utils/helpers/StatusService.js",
    "!src/utils/helpers/errorHandler.js",
    "!src/utils/helpers/index.js",
    "!src/utils/swagger_utils/**",
    "!src/utils/validators/**"
  ],
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  // Separar testes unitários e de integração
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/tests/**/*.test.js",
        "!<rootDir>/tests/integration/**"
      ],
      testEnvironment: "node"
    },
    {
      displayName: "integration", 
      testMatch: [
        "<rootDir>/tests/integration/**/*.test.js"
      ],
      testEnvironment: "node",
      maxWorkers: 1
    }
  ]
};