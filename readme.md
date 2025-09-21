# Gestão de estoque

## Objetivo do Projeto
O projeto **Gestão de Estoque** tem como principal objetivo oferecer uma solução tecnológica para auxiliar empresas no controle de produtos, fornecedores e movimentações de estoque. A plataforma permite cadastrar e gerenciar produtos, acompanhar entradas e saídas, monitorar níveis mínimos de estoque e gerar relatórios de movimentações. O foco é otimizar a administração de recursos, reduzir perdas e facilitar a tomada de decisão por parte dos gestores.

## Funcionalidades
* Cadastro e login de usuários;
* Cadastro e gerenciamento de produtos;
* Cadastro e gerenciamento de fornecedores;
* Controle de movimentações de entrada e saída;
* Acompanhamento do estoque atual e estoque mínimo;
* Identificação de produtos com estoque baixo;
* Relatórios de movimentação e estoque;
* Controle de acesso de usuários com base em níveis de permissão;
* Divisão de produtos por categoria.

## Tecnologias Utilizadas

* Node.js
* Express
* Nodemailer
* Zod
* MongoDB
* Mongoose
* JWT
* Bcrypt
* Swagger
* Docker
* Jest
* ESLint
* Nodemon

## Requisitos
Para executar o projeto localmente ou em ambiente de produção, siga as instruções abaixo. Antes de iniciar, certifique-se de configurar corretamente as variáveis de ambiente, utilizando como referência o arquivo .env.example localizado na raiz do projeto.

<br/>

      #clone este repositório
      git clone <https://gitlab.fslab.dev/fabrica-de-software-iii-2025-2/gestao-de-estoque/gestao-de-estoque-api.git>

      # Acesse a pasta do projeto no terminal/cmd
      cd gestao-de-estoque-api

      # Instale as dependências com o comando
      npm install

      # Executar seeds para popular o banco
      npm run seed

      # Execute a aplicação em modo de desenvolvimento
      npm run dev

## Para executar o docker
* É necessário docker baixado em sua máquina

        # Subir o container
        docker-compose up -d

        # Parar o container
        docker-compose down

        # Reconstruir o container e subir
        docker-compose up --build

## Execução dos testes

    # Para executar os testes rode:
    npm run test


## Equipe

| NOME                | Função   | E-MAIL                 |
| :------------------ | :------ | :--------------------- |
| Matheus Lucas Batista | Analista e Gerente de projeto | matheusifro2020@gmail.com |
| Lucca Fernandes Livino | Analista | lucca.f.livino@gmail.com |
| Deivid Luiz Costa Pereira | Analista | lidia_tagarro@hotmail.com |
