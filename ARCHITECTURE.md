# Arquitetura e decisões

## Responsabilidades

```
React pages / shadcn-style UI / Tailwind
        |
TanStack Router + URL search params     TanStack Query + query keys
        |                                     |
        +---------------------- Axios /api ---+
                                            |
                           MSW REST handlers (no navegador)
                                            |
                                Mock DB em localStorage
                                            |
                           Eventos em WebSocket via MSW
                                            |
                             Socket.IO-client + binding
                                            |
                       invalidação / reconciliação REST
```

- `src/pages`: interface. Sem dados falsos codificados como retorno de negócio.
- `src/api/client.ts`: cliente único Axios com token e guest ID. Cancelamento do catálogo via `AbortSignal`.
- `src/hooks/useApp.ts`: cache, mutations e sockets. Favoritos são otimistas com rollback.
- `src/mocks/db.ts`: fixtures, persistência, reset, dois usuários.
- `src/mocks/handlers.ts`: contratos REST, validações, cálculos Decimal.js, estado de pedidos e idempotência.
- `src/mocks/socket.ts`: interceptação WebSocket compatível com protocolo Socket.IO (biblioteca `@mswjs/socket.io-binding`).

## Contratos REST (resumo)

| Método | Caminho | Corpo / retorno |
| --- | --- | --- |
| GET | `/api/nfts?q=&category=&network=&sort=&page=` | `{items,total,pages,page}` |
| GET | `/api/nfts/:id` | `Nft` ou 404 |
| POST | `/api/auth/register` | `{name,email,password}` |
| POST | `/api/auth/login` | `{email,password,guestId}` → `{token,user}` |
| GET / POST | `/api/auth/session`, `/api/auth/logout` | sessão/encerramento |
| GET / PUT / DELETE | `/api/favorites`, `/api/favorites/:id` | `string[]` |
| GET / PUT | `/api/cart`, `/api/cart/:id` | `CartViewItem[]`; PUT `{quantity}` |
| POST | `/api/quote` | `{coupon,network}` → `Quote` |
| GET / PATCH | `/api/profile` | `User` / `{name,avatar}` |
| POST | `/api/profile/password` | `{oldPassword,newPassword}` |
| GET / POST / PATCH | `/api/wallets`, `/api/wallets/:id` | `Wallet` |
| POST | `/api/orders` | `{quote,walletId}` + cabeçalho `Idempotency-Key` → `Order` |
| GET | `/api/orders`, `/api/orders/:id` | consulta privada de pedidos |
| GET | `/api/orders/by-key/:key` | recuperação da mesma tentativa |
| POST | `/api/demo/nfts/:id/change` | dispara atualização de preço |
| POST | `/api/demo/reset`, `/api/demo/expire` | controles determinísticos |

Erro HTTP: `{code:string,message:string}`, incluindo 401, 404, 409, 422 e 500. Rotas privadas exigem token. Os métodos privados usam o usuário autenticado no mock para resolver a chave do cache local.

## Models / dinheiro

- Preços e totais trafegam como **strings decimais**, e aritmética usa `decimal.js`.
- Quantidades são inteiras e não ultrapassam `supply`.
- Cotação contém `items`, `subtotal`, `discount`, `fee`, `total`, `network`, `coupon`, `id`, `expiresAt`.
- Identificação de cotação leva em conta valores, quantidades, versões, rede e cupom; checkout revalida o snapshot em relação ao estado atual.
- Cupom fictício `AURORA10`: desconto de 10%. Taxas de rede: Ethereum `0.009`, Polygon `0.003`, Base `0.002` ETH.
- Recibo usa `structuredClone` da cotação salva no momento da criação do pedido. Atualização posterior do NFT não altera recibo.

## Sessão e isolamento

Token simulado em `localStorage`, guest ID separado. Login mescla carrinho de convidado no carrinho privado respeitando estoque. Cookies reais e backend não estão incluídos.

Query keys de recursos privados incluem ID de usuário. Ao fazer logout/trocar token, limpa-se o QueryClient e o listener de tempo real é desmontado/recriado. Sessão é recuperada pelo GET `/auth/session`. APIs 401 encerram sessão, mas o contexto da URL de checkout continua para voltar depois do login.

## Query e retries

`staleTime`: 8 s padrão; sessão 60 s. Query REST: 1 retry apenas para falhas de rede ou 5xx; mutations: nenhum retry automático. Catálogo isola parâmetros em chave do Query e aborta requisições obsoletas com `AbortSignal`. Invalidações após mutação: carrinho, cotação, favoritos, carteiras e sessão. Eventos Socket invalidam os recursos afetados para sincronizar com REST. Operações financeiras usam `Idempotency-Key` para assegurar que reenvio da mesma tentativa não gere nova compra.

## Estados de pedido

```
POST /orders: pending -> GET /orders/:id -> confirmed | declined
```

Criação idempotente: a chave armazena fingerprint. Mesmo conteúdo devolve o mesmo `Order`; conteúdo diferente com mesma chave devolve 409. A compra só mostra recibo confirmado após consulta devolver `confirmed`. Em caso de timeout após criação, consulta `/orders/by-key/:key` recupera a tentativa. Persistência local protege pedidos contra refresh. Estoque e carrinho mudam apenas na confirmação.

## Eventos e Socket.IO

- `nft.updated`: `{resourceId,version,resource}`
- `order.updated`: `{resourceId,userId,version,status}`

Cliente `socket.io-client`, transporte WebSocket (`transports:['websocket']`). Handler MSW com `ws.link` e codec `SocketIo` do pacote `@mswjs/socket.io-binding`. Broadcast envia tuplas codificadas `[event,payload]`. O mock dá suporte básico a eventos de texto e namespace padrão, não replica todos os recursos do servidor Socket.IO. Eventos duplicados/antigos são filtrados por versão em cache ou por mapa de versões; reconexão invalida recursos ativos para reconciliação com REST.

## UI e performance

- Layout responsivo em grid para 390px / 768px / 1440px, imagens SVG leves em arquivo local.
- Skeletons para catálogo, detalhe e carrinho (respeita `prefers-reduced-motion`).
- Componentes `button`, `input` e `dialog` usam padrões de `shadcn/ui`; diálogo usa primitivos Radix para controle de foco.
- Imagens têm texto alternativo. Inputs recebem labels. Alertas usam `role=alert` / `role=status`.
- Auditar antes da submissão: 3 rodadas por página/perfil, reportar mediana e métricas LCP/CLS/TBT.

## Pendências para cumprir 100% do desafio

1. **Figma exato**: substituir visual provisório pelos frames e assets autorizados.
2. **Instalação e compilação**: executar `npm install`, `npm run build`, `npm run lint` e reparar erros eventuais, ausentes por falta de registry npm no ambiente de autoria.
3. **MSW + Socket.IO**: confirmar a compatibilidade de versões do binding em navegador local e publicado.
4. **Testes**: complementar matriz completa de Playwright, incluindo baselines commitadas, reconexão, duplicatas, timeout e fluxo de recusa.
5. **Performance**: executar script audit, atingir metas ou justificar divergências com dados reais.
6. **Deploy**: URL pública validada e acessível; refresh de rotas e service worker funcionando.
7. **Cenários avançados**: simular falhas em todas as APIs; conexão offline realista; teste de conflito com duas sessões; isolamento completo em abas múltiplas.
8. **Acessibilidade**: revisão manual de teclado, zoom, semântica de elementos interativos e foco em drawers.
