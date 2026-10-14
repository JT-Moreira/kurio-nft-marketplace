# KURIO · NFT Marketplace (desafio frontend)

Protótipo de marketplace React + TypeScript, **somente dados simulados**. Checkout, senhas, endereços e referências de transação não são reais.

> **Status**: versão visual KURIO v2 baseada nos prints fornecidos, com backend mockado em desenvolvimento. **Não é uma entrega certificada/pronta para submissão.** Ainda deve ser instalado, executado, depurado, adaptado ao Figma, testado e auditado. O ambiente onde o arquivo foi gerado não acessa o registry npm nem o Figma, logo as dependências não foram baixadas e não foi possível executar `npm run build`, Playwright ou Lighthouse.

## Executar no Windows (PowerShell / terminal VS Code)

Pré-requisito: Node.js LTS instalado (Node 22+). Se `npm` não for reconhecido, instale em https://nodejs.org/pt, reinicie o VS Code e use `npm.cmd` no PowerShell.

```powershell
cd nft-marketplace-starter
npm.cmd install
npm.cmd run dev
```

Abra **http://localhost:5173/**. O `postinstall` chama `msw init public --save`, gerando `public/mockServiceWorker.js`, necessário tanto no modo local como no deploy. `npm install` também gera `package-lock.json`. **Commitar ambos** no Git.

Se o worker não tiver sido gerado, execute:

```powershell
npx msw init public --save
```

Caso `msw` peça autorização, confirme. O mock inicia antes do React. Defina `VITE_ENABLE_MOCKS=false` para desabilitar os mocks (a interface então necessita de uma API real, que está fora do escopo).

### Comandos

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
npm run audit
```

`npm run audit` exige `npm run preview` em outro terminal. Os relatórios são salvos em `lighthouse-reports/`.

## Credenciais fictícias

| Conta | E-mail | Senha |
| --- | --- | --- |
| Demo 1 | `demo@aurora.dev` | `Demo123!` |
| Demo 2 | `colecionador@aurora.dev` | `Teste123!` |

As senhas de usuários são representadas por hashes na persistência simulada, nunca em texto claro. **Essa simulação não é um sistema seguro para produção**; autenticação e hashing reais devem ocorrer no backend.

## Cenários reproduzíveis

Clique em **Cenários de teste** no menu. Há opções de rede lenta, respostas fora de ordem, indisponibilidade REST no catálogo, erro 500, falha de favorito, pagamento recusado e timeout após criação. A página do NFT tem botão para alterar preço via API mockada; após a alteração, os eventos são publicados em `nft.updated` para clientes conectados.

- Cupom válido: `AURORA10` (código técnico ainda usado no mock) (10% de desconto)
- Cupom expirado: `OLD10`
- Qualquer outro código: inválido
- Clique em **Expirar sessão** para avaliar o retorno ao login
- Clique em **Reset completo** para restaurar o estado conhecido
- Ao trocar cenário, recarregue a página para um fluxo determinístico

## Deploy Vercel gratuito

1. Abra o repositório no GitHub (sem chaves e sem `.env.local`).
2. Importe em [Vercel](https://vercel.com/).
3. Framework: **Vite**; build `npm run build`; output `dist`.
4. Ambiente: `VITE_ENABLE_MOCKS=true`, `VITE_SOCKET_URL=ws://localhost:8788` (endereço fictício capturado pelo MSW no próprio navegador; não é backend na nuvem).
5. Teste diretamente `/nft/nft-01` e `/cart` após refresh. `vercel.json` garante SPA fallback.

Não confunda o `VITE_SOCKET_URL` com um servidor de rede existente: o Service Worker / interceptação MSW deve capturar o WebSocket simulado conforme a compatibilidade da biblioteca instalada.

## Layout

**Visual atualizado:** a referência foi extraída dos prints desktop/mobile enviados: identidade KURIO, cores cobre/marrom, novo layout da página inicial, sidebar desktop, grade mobile e retratos locais. As imagens de personagens são RECORTES DOS PRINTS, não assets originais do Figma, e possuem resolução limitada. O restante das telas reutiliza o tema mas precisa de uma conferência visual comparando cada frame. Exportar imagens originais do Figma antes da entrega final, se possível.

## Limitações conhecidas e pendências

- Não há lockfile no arquivo original porque o registry npm não estava disponível no ambiente de geração; crie e versione com `npm install`.
- Playwright possui fluxos e casos visuais iniciais; **é obrigatório executar os testes, corrigir flakiness e criar/versionar baselines** (`npx playwright test --update-snapshots`).
- Falta ampliar regressão visual para checkout e cobertura de cenários terminais, reconexão e eventos antigos.
- A URL pública não foi publicada; a entrega exige deploy funcionando.
- A simulação da carteira cobre conexão, recusa e desconexão no cliente. Não usa extensões de blockchain, por exigência do desafio.
- As latências/falhas determinísticas são um ponto de partida e devem ser expandidas para recursos além do catálogo.
- O manuseio de estoque e pedidos na persistência local é demonstrativo, não substitui transações de banco concorrentes.
- Não foi possível executar build e auditorias sem instalar dependências. **Valide a integração Socket.IO + MSW instalada antes de apresentar como concluída.**

Consulte `ARCHITECTURE.md` para contratos, cache, ciclo de dados e pendências.

## Status das telas do Figma

- Início desktop/mobile: estrutura visual revisada, sidebar, hero, cards, editorial e benefícios.
- Detalhe, carrinho, checkout, pedido, login, cadastro, perfil e carteiras: mantêm os fluxos da base anterior e agora herdam cores/tipografia de KURIO. Ainda é necessário alinhar suas composições aos screenshots individuais.
- Os quatro retratos WEBP são recortes temporários dos prints fornecidos pelo candidato. Para fidelidade real e pontuação Lighthouse, exportar assets nativos otimizados do Figma é recomendado.
- O CSS possui padrões responsivos para 390, 768 e 1440px, mas não foi auditado em navegador neste ambiente.
