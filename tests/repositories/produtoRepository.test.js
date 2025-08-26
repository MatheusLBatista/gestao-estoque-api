import { beforeAll, afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ProdutoRepository from '../../src/repositories/produtoRepository.js';
import Produto from '../../src/models/Produto.js';

// Mock do console.log para evitar poluir a saída dos testes
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ProdutoRepository', () => {
    let mongoServer;
    let produtoRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Produto.deleteMany({});
        produtoRepository = new ProdutoRepository();
    });

    describe('Constructor', () => {
        it('should initialize repository', () => {
            expect(produtoRepository).toBeDefined();
        });
    });

    describe('criarProduto', () => {
        it('should create a new product', async () => {
            const produtoData = {
                nome_produto: 'Produto Teste',
                descricao: 'Descrição do produto teste',
                preco: 100.50,
                categoria: 'Categoria Teste',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD001'
            };

            const produto = await Produto.create(produtoData);

            expect(produto).toBeDefined();
            expect(produto.nome_produto).toBe(produtoData.nome_produto);
            expect(produto.preco).toBe(produtoData.preco);
            expect(produto.estoque).toBe(produtoData.estoque);
        });

        it('should handle product creation with all fields', async () => {
            const produtoData = {
                nome_produto: 'Produto Completo',
                descricao: 'Descrição completa',
                preco: 200.75,
                categoria: 'Eletrônicos',
                custo: 150,
                estoque: 5,
                estoque_min: 2,
                marca: 'Marca Teste',
                id_fornecedor: 1,
                codigo_produto: 'PROD002'
            };

            const produto = await Produto.create(produtoData);

            expect(produto).toBeDefined();
            expect(produto.nome_produto).toBe(produtoData.nome_produto);
            expect(produto.marca).toBe(produtoData.marca);
            expect(produto.categoria).toBe(produtoData.categoria);
        });
    });

    describe('listarProdutos', () => {
        beforeEach(async () => {
            // Criar alguns produtos para teste com todos os campos obrigatórios
            await Produto.create([
                {
                    nome_produto: 'Produto 1',
                    descricao: 'Descrição 1',
                    preco: 100,
                    categoria: 'Cat1',
                    custo: 80,
                    estoque: 10,
                    estoque_min: 5,
                    id_fornecedor: 1,
                    codigo_produto: 'PROD001'
                },
                {
                    nome_produto: 'Produto 2',
                    descricao: 'Descrição 2',
                    preco: 200,
                    categoria: 'Cat2',
                    custo: 180,
                    estoque: 20,
                    estoque_min: 10,
                    id_fornecedor: 2,
                    codigo_produto: 'PROD002'
                }
            ]);
        });

        it('should list all products', async () => {
            const mockReq = { query: {} };
            const result = await produtoRepository.listarProdutos(mockReq);

            expect(result).toBeDefined();
            expect(result.docs).toHaveLength(2);
            expect(result.docs[0].nome_produto).toBe('Produto 1');
            expect(result.docs[1].nome_produto).toBe('Produto 2');
        });

        it('should list products with pagination', async () => {
            const mockReq = { query: { page: 1, limite: 1 } };
            const result = await produtoRepository.listarProdutos(mockReq);

            expect(result).toBeDefined();
            expect(result.docs).toHaveLength(1);
            expect(result.totalPages).toBe(2);
            expect(result.page).toBe(1);
        });

        it('should filter products by name', async () => {
            const mockReq = { query: { nome_produto: 'Produto 1' } };
            const result = await produtoRepository.listarProdutos(mockReq);

            expect(result).toBeDefined();
            expect(result.docs).toHaveLength(1);
            expect(result.docs[0].nome_produto).toBe('Produto 1');
        });

        it('should return product by ID', async () => {
            const produto = await Produto.findOne({ nome_produto: 'Produto 1' });
            const mockReq = { params: { id: produto._id.toString() } };
            
            const result = await produtoRepository.listarProdutos(mockReq);

            expect(result).toBeDefined();
            expect(result._id.toString()).toBe(produto._id.toString());
        });
    });

    describe('buscarProdutoPorID', () => {
        it('should find product by valid ID', async () => {
            const produtoData = {
                nome_produto: 'Produto Busca',
                descricao: 'Descrição busca',
                preco: 150,
                categoria: 'Cat',
                custo: 120,
                estoque: 5,
                estoque_min: 2,
                id_fornecedor: 1,
                codigo_produto: 'PROD003'
            };

            const produtoCreated = await Produto.create(produtoData);
            const produto = await produtoRepository.buscarProdutoPorID(produtoCreated._id.toString());

            expect(produto).toBeDefined();
            expect(produto._id.toString()).toBe(produtoCreated._id.toString());
            expect(produto.nome_produto).toBe(produtoData.nome_produto);
        });

        it('should throw error for non-existent ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            await expect(produtoRepository.buscarProdutoPorID(nonExistentId.toString()))
                .rejects.toThrow('Produto não encontrado');
        });
    });

    describe('cadastrarProduto', () => {
        it('should create product successfully', async () => {
            const produtoData = {
                nome_produto: 'Produto Cadastro',
                descricao: 'Descrição cadastro',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD004'
            };

            const produto = await produtoRepository.cadastrarProduto(produtoData);

            expect(produto).toBeDefined();
            expect(produto.nome_produto).toBe(produtoData.nome_produto);
            expect(produto.codigo_produto).toBe(produtoData.codigo_produto);
        });

        it('should throw error for duplicate codigo_produto', async () => {
            const produtoData = {
                nome_produto: 'Produto Duplicado',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD005'
            };

            // Criar o primeiro produto
            await produtoRepository.cadastrarProduto(produtoData);

            // Tentar criar produto com mesmo código
            const produtoData2 = { ...produtoData, nome_produto: 'Produto Duplicado 2' };
            
            await expect(produtoRepository.cadastrarProduto(produtoData2))
                .rejects.toThrow('Já existe um produto com este código');
        });
    });

    describe('atualizarProduto', () => {
        it('should update product successfully', async () => {
            const produtoData = {
                nome_produto: 'Produto Original',
                descricao: 'Descrição original',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD006'
            };

            const produtoCreated = await Produto.create(produtoData);
            const updateData = { nome_produto: 'Produto Atualizado', preco: 200 };

            const produtoAtualizado = await produtoRepository.atualizarProduto(
                produtoCreated._id.toString(),
                updateData
            );

            expect(produtoAtualizado).toBeDefined();
            expect(produtoAtualizado.nome_produto).toBe('Produto Atualizado');
            expect(produtoAtualizado.preco).toBe(200);
            expect(produtoAtualizado.descricao).toBe(produtoData.descricao); // Should remain unchanged
        });

        it('should throw error when updating non-existent product', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updateData = { nome_produto: 'Produto Inexistente' };

            await expect(produtoRepository.atualizarProduto(
                nonExistentId.toString(),
                updateData
            )).rejects.toThrow('Produto não encontrado');
        });

        it('should throw error for duplicate codigo_produto on update', async () => {
            // Criar dois produtos
            const produto1 = await Produto.create({
                nome_produto: 'Produto 1',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD007'
            });

            const produto2 = await Produto.create({
                nome_produto: 'Produto 2',
                preco: 200,
                categoria: 'Cat',
                custo: 160,
                estoque: 20,
                estoque_min: 10,
                id_fornecedor: 2,
                codigo_produto: 'PROD008'
            });

            // Tentar atualizar produto2 com o código do produto1
            await expect(produtoRepository.atualizarProduto(
                produto2._id.toString(),
                { codigo_produto: 'PROD007' }
            )).rejects.toThrow('Este código já está sendo usado por outro produto');
        });
    });

    describe('deletarProduto', () => {
        it('should delete product successfully', async () => {
            const produtoData = {
                nome_produto: 'Produto Deletar',
                descricao: 'Descrição deletar',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD009'
            };

            const produtoCreated = await Produto.create(produtoData);
            const result = await produtoRepository.deletarProduto(produtoCreated._id.toString());

            expect(result).toBeDefined();
            expect(result._id.toString()).toBe(produtoCreated._id.toString());

            // Verificar se foi realmente deletado
            const produtoExiste = await Produto.findById(produtoCreated._id);
            expect(produtoExiste).toBeNull();
        });

        it('should throw error when deleting non-existent product', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            await expect(produtoRepository.deletarProduto(nonExistentId.toString()))
                .rejects.toThrow('Produto não encontrado');
        });
    });

    describe('listarEstoqueBaixo', () => {
        beforeEach(async () => {
            await Produto.create([
                {
                    nome_produto: 'Produto Estoque Alto',
                    preco: 100,
                    categoria: 'Cat',
                    custo: 80,
                    estoque: 100,
                    estoque_min: 10,
                    id_fornecedor: 1,
                    codigo_produto: 'PROD010'
                },
                {
                    nome_produto: 'Produto Estoque Baixo',
                    preco: 200,
                    categoria: 'Cat',
                    custo: 160,
                    estoque: 5,
                    estoque_min: 10,
                    id_fornecedor: 2,
                    codigo_produto: 'PROD011'
                }
            ]);
        });

        it('should list products with low stock', async () => {
            const produtos = await produtoRepository.listarEstoqueBaixo();
            
            expect(produtos).toBeDefined();
            expect(produtos).toHaveLength(1);
            expect(produtos[0].nome_produto).toBe('Produto Estoque Baixo');
            expect(produtos[0].estoque).toBeLessThan(produtos[0].estoque_min);
        });
    });

    describe('desativarProduto', () => {
        it('should deactivate product successfully', async () => {
            const produtoData = {
                nome_produto: 'Produto Desativar',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD012'
            };

            const produtoCreated = await Produto.create(produtoData);
            const result = await produtoRepository.desativarProduto(produtoCreated._id.toString());

            expect(result).toBeDefined();
            expect(result.status).toBe(false);
        });
    });

    describe('reativarProduto', () => {
        it('should reactivate product successfully', async () => {
            const produtoData = {
                nome_produto: 'Produto Reativar',
                preco: 100,
                categoria: 'Cat',
                custo: 80,
                estoque: 10,
                estoque_min: 5,
                id_fornecedor: 1,
                codigo_produto: 'PROD013',
                status: false
            };

            const produtoCreated = await Produto.create(produtoData);
            const result = await produtoRepository.reativarProduto(produtoCreated._id.toString());

            expect(result).toBeDefined();
            expect(result.status).toBe(true);
        });
    });
});
