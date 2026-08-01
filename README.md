# API de Agendamento de Salas

API REST para gerenciamento de salas de reunião e reservas, desenvolvida com Node.js e Express.

## Executar localmente

Pré-requisito: Node.js 18 ou superior.

```powershell
npm install
npm start
```

A API será iniciada em `http://localhost:3000`.

Para desenvolvimento com reinicialização automática após alterações nos arquivos:

```powershell
npm run dev
```

### Portas e documentação

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

Por padrão, a aplicação utiliza a porta `3000`. Para alterá-la, defina a variável de ambiente `PORT`, por exemplo:

```powershell
$env:PORT=4000
npm start
```

## Consultar disponibilidade de salas

Consulta todas as salas cadastradas e informa se cada uma está disponível no intervalo solicitado. Quando houver uma reserva sobreposta, também informa o funcionário responsável.

```http
GET /api/salas/disponibilidade?inicio=2026-08-01T14:00:00Z&fim=2026-08-01T15:00:00Z
```

Parâmetros obrigatórios:

- `inicio`: data e hora inicial no formato ISO 8601.
- `fim`: data e hora final no formato ISO 8601, posterior a `inicio`.

Exemplo de resposta de sucesso (`200 OK`):

```json
[
  {
    "id": "sala-1",
    "nome": "Sala Atlântico",
    "disponivel": true,
    "reservaDe": null
  },
  {
    "id": "sala-2",
    "nome": "Sala Pacífico",
    "disponivel": false,
    "reservaDe": "Funcionário Demo"
  }
]
```

Se `fim` for menor ou igual a `inicio`, a API retorna `400 Bad Request`:

```json
{
  "erros": [
    {
      "codigo": "INTERVALO_INVALIDO",
      "mensagem": "A data final deve ser maior que a data inicial."
    }
  ]
}
```

Atualmente, esse endpoint está disponível sem autenticação.
