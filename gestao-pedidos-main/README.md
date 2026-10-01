Gestão de Pedidos — AdonisJS + Angular

Aplicação para cadastro de clientes e produtos e para criação e acompanhamento de pedidos.

- Backend: AdonisJS (Lucid ORM, VineJS) com SQLite
- Frontend: Angular 

 Como rodar

 Backend (porta 3333)

```bash
cd backend
npm install
cp .env.example .env
node ace generate:key
node ace migration:fresh --seed
npm run dev
```

Testes automatizados (usam um banco separado, `tmp/db.test.sqlite3`):

```bash
node ace test
```

Frontend (porta 4200)

```bash
cd frontend
npm install
npm start
```

Testes: `npm test`. A URL da API fica em `frontend/src/app/core/config.ts`.

 API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/customers` | Lista clientes |
| POST | `/customers` | Cadastra cliente (`name`, `phone`) |
| PUT/PATCH | `/customers/:id` | Edita cliente |
| GET | `/products` | Lista produtos |
| POST | `/products` | Cadastra produto (`name`, `price`, `isActive?`) |
| PUT/PATCH | `/products/:id` | Edita produto / ativa / desativa |
| GET | `/orders?status=&search=` | Lista pedidos, com filtro por status e busca por cliente ou nº |
| GET | `/orders/:id` | Consulta um pedido |
| POST | `/orders` | Cria pedido (`customerId`, `items: [{ productId, quantity }]`) |
| PATCH | `/orders/:id/status` | Altera o status (`status`) |

Erros seguem sempre o formato `{ "message": "...", "errors"?: [...] }` — `422` para validação e regra de negócio, `404` para registro inexistente(problema).

 Onde cada regra de negócio está

| Regra | Onde |
| --- | --- |
| Pedido exige cliente, ao menos 1 produto e quantidade mínima 1 | `app/validators/order.ts` |
| Produto inativo não entra em pedido novo | `app/services/order_service.ts` |
| Total calculado no backend, preço do produto gravado no item | `app/services/order_service.ts` (dentro de uma transação) |
| Fluxo de status e cancelamento irreversível | `app/enums/order_status.ts` + `OrderService.changeStatus` |

 Decisões

- Preço congelado no item: `order_items` guarda `unit_price`, `total_price` e `product_name` no momento da compra, então reajustar um produto não altera pedidos antigos.
- Status: `PENDING → IN_PREPARATION → READY → FINISHED`. Pode cancelar até finalizar; `FINISHED` e `CANCELED` são estados finais.
- Camadas: controllers finos → validators (entrada) → service (regras) → models Lucid (dados).
- Erros: um handler global (`app/exceptions/handler.ts`) padroniza as respostas; no Angular, um interceptor exibe a mensagem em um só lugar.
