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

<br>

2. **Instalar as dependências**

  ```bash
  npm install
  ```

<br>

3. **Criar arquivo .env**
  Crie um arquivo chamado `.env` na raiz do projeto, e copie e cole o conteúdo de `.env.example` nele;

<br>

4. **Rodar o banco de dados local**
  No terminal, dentro da raiz do projeto, execute:
  ```bash
  docker compose up -d
  ```

<br>

5. **Rodar o aplicativo**

  ```bash
  npm run start
  ```

  ou para o servidor pegar as alterações em tempo real (sem precisar de **ctrl+c** -> **npm run start**):

  ```bash
  npm run start:dev
  ```

<br>

5. **Rodar os testes**
  obs: execute quando quiser ver se os testes estão funcionando

  ```bash
  npm run test
  ```

  e para executar os testes e ver o quanto eles estão cobrindo o código:

  ```bash
  npm run test:cov
  ```


<br><br>

## Estrutura do projeto

```
  ├── drizzle/                   // 💾 Migrations do Drizzle ORM
  │   └── meta/
  └── src/
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

