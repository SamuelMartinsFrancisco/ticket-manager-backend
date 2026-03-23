# 🌙 Ticket management app backend 🌙

Código fonte do back-end do aplicativo mobile de suporte de T.I., para priorização inteligente e gerenciamento de chamados.

<br>

## Início

Para começar a contribuir neste projeto, é necessário que você clone este repositório em sua máquina, e depois, siga os **passos** abaixo. Antes de executar os comandos, lembre-se de entrar na pasta do projeto, ou eles não vão funcionar.

<br>

1. **Instalar as dependências**

  ```bash
  npm install
  ```

<br>

2. **Rodar o aplicativo**

  ```bash
  npm run start
  ```

  ou para o servidor pegar as alterações em tempo real (sem precisar de **ctrl+c** -> **npm run start**):

  ```bash
  npm run start:dev
  ```

<br>

4. **Rodar os testes**

  ```bash
  npm run test
  ```

  e para executar os testes e ver o quanto ele estão cobrindo o código:

  ```bash
  npm run test:cov
  ```


<br><br>

## Estrutura do projeto

```
  └── src
    ├── app
    ├── config
    ├── infrastructure
    │   └── database
    │       ├── client
    │       ├── repositories
    │       └── schema
    ├── middleware
    ├── modules
    │   └── example
    │       ├── controllers
    │       ├── dtos
    │       └── services
    └── utils
```

<br><br>

## Ajuda

- [Guia básico sobre GitHub](https://www.freecodecamp.org/portuguese/news/o-guia-do-iniciante-para-o-git-e-o-github/)
- [Primeiros passos com React Native](https://reactnative.dev/docs/getting-started)