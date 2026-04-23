# 🌙 Ticket management app backend 🌙

Código fonte do back-end do aplicativo mobile de suporte de T.I., para priorização inteligente e gerenciamento de chamados.

<br>

## Início

### Requisitos

Este projeto requer alguns programas para funcionar, os quais estão listados abaixo. Você pode encontrar maiores detalhes sobre a instalação deles na seção "Ajuda";

- nvm (Node Version Manager);
- Docker;

---

<br>

Para começar a contribuir neste projeto, é necessário que você clone este repositório em sua máquina, e depois, siga os **passos** abaixo. Antes de executar os comandos, lembre-se de entrar na pasta do projeto, ou eles não vão funcionar.

<br>

1. **Instalar a versão do Node utilizada no projeto**
  ```bash
  nvm install
  ```

<br><br>

2. **Instalar as dependências**

  ```bash
  npm install
  ```

<br><br>

3. **Criar arquivo .env**
  
  Crie um arquivo chamado `.env` na raiz do projeto, e copie e cole o conteúdo de `.env.example` nele; dê os valores às variáveis;

<br><br>

4. **Rodar o banco de dados local**
  No terminal, dentro da raiz do projeto, execute:
  ```bash
  docker compose up -d
  ```

<br><br>

5. **Gerar SQL para criação das tabelas no banco de dados**

  ```bash
  npm run drizzle:migrate
  ```

<br><br>

6. **Rodar o aplicativo**

  ```bash
  npm run start
  ```

  ou para o servidor pegar as alterações em tempo real (sem precisar de **ctrl+c** -> **npm run start**):

  ```bash
  npm run start:dev
  ```

<br><br>

7. **Criar o primeiro usuário (admin)**
  Abra um novo terminal, e execute o comando abaixo:

  ```bash
  npm run drizzle:seed
  ```

<br><br>

8. **Rodar os testes**
  
  obs: execute quando quiser ver se os testes estão funcionando

  ```bash
  npm run test
  ```

  e para executar os testes e ver o quanto eles estão cobrindo o código:

  ```bash
  npm run test:cov
  ```

  <br><br>

9. **Quando você for encerrar tudo**
  
  parar a execução do servidor:
  ```
  ctrl + c
  ```

  [parar execução  do banco de dados - alternativas - escolha a que você preferir]

  Remover o banco totalmente (incluindo os dados):
  ```bash
  docker compose down 
  ```

  Somente parar a execução do banco
  ```bash
  docker compose stop

  # neste caso, na próxima vez que inicializar a aplicação use "docker compose start" em vez de "docker compose up"
  ```

<br><br>

10. **Documentação das APIs (Swagger)**

Para ver a documentação das APIs, acesse: 
- [localhost:3000/api](http://localhost:3000/api)

<br><br>

## Estrutura do projeto

```
  ├── drizzle/                   // 💾 Migrations do Drizzle ORM
  │   └── meta/
  └── src/
      ├── core/                  // 🏗️ Componentes essenciais do servidor (como guards de autenticação e controle de acesso)
      ├── infrastructure/        // 🏗️ Infraestrutura (banco, serviços externos)
      │   └── database/          // 💾 Configuração do banco de dados e definição de tabelas (schemas)
      │       └── schema/
      ├── middleware/            // 🔗 Middlewares globais (autenticação, logs, etc.)
      ├── modules/               // 🧩 Módulos de negócio (casos de uso)
      └── utils/                 // 🛠️ Funções utilitárias reutilizáveis
          └── test/              // 🧪 Helpers e mocks para testes automatizados
```

<br><br>

## Ajuda

- [Documentação - NestJS](https://docs.nestjs.com/controllers);
- [Documentação - Drizzle ORM](https://orm.drizzle.team/docs/get-started/postgresql-new);
- [Documentação - Jest](https://jestjs.io/docs/using-matchers)

### Instalações

- [Como instalar o NVM](https://www.treinaweb.com.br/blog/instalando-e-gerenciando-varias-versoes-do-node-js-com-nvm);
- [Como instalar o Docker](https://medium.com/@piyushkashyap045/comprehensive-guide-installing-docker-and-docker-compose-on-windows-linux-and-macos-a022cf82ac0b);

