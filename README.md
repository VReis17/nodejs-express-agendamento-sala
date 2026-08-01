# API de Agendamento de Salas

API REST em Node.js e Express para autenticar funcionários, consultar salas, criar reservas e cancelar uma reserva sem excluir seu histórico.

## Instalação e execução

Requisitos: Node.js 18 ou superior.

```bash
npm install
copy .env.example .env
npm start
```

Em ambientes Unix, substitua `copy` por `cp`. A API inicia por padrão em `http://localhost:3000`.

Para executar os testes automatizados:

```bash
npm test
```

## Autenticação

Solicite um JWT em `POST /api/auth/login`:

```json
{
  "email": "funcionario@empresa.com",
  "password": "Funcionario@123"
}
```

Use o token retornado nos endpoints protegidos:

```http
Authorization: Bearer <token>
```

Contas locais disponíveis:

- Gerente: `gerente@empresa.com` / `Gerente@123`
- Funcionário: `funcionario@empresa.com` / `Funcionario@123`

## Cancelamento de reserva

O endpoint `PATCH /api/reservas/:id/cancelar` permite que o funcionário autenticado cancele somente uma reserva própria e com status `ATIVA`. O registro permanece no banco em memória e apenas seu status muda para `CANCELADA`.

Exemplo de sucesso:

```json
{
  "mensagem": "Reserva cancelada com sucesso.",
  "reserva": {
    "id": "7",
    "status": "CANCELADA"
  }
}
```

O endpoint responde com `401` para autenticação ausente ou inválida, `403` para reserva de outro funcionário, `404` para id inexistente e `409` quando a reserva não está ativa.

## Swagger

Com a aplicação em execução, a documentação interativa fica disponível em `http://localhost:3000/api-docs`. A especificação OpenAPI está em `docs/openapi.json`.

## Estrutura do projeto

```text
docs/                especificação OpenAPI
src/
  config/            configuração por variáveis de ambiente
  controllers/       adaptação entre HTTP e regras de negócio
  middlewares/       autenticação e tratamento de erros
  models/            dados em memória e estados do domínio
  routes/            definição dos endpoints
  services/          regras de negócio
  utils/             utilitários compartilhados
test/                 testes automatizados da API
```
