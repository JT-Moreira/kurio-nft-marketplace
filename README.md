# KURIO · NFT Marketplace (desafio frontend)

Protótipo de marketplace React + TypeScript, **somente dados simulados**. Checkout, senhas, endereços e referências de transação não são reais.

> **Status em 14/10/2026:** publicado no GitHub e Vercel. Build, 24 testes funcionais, 8 testes visuais e metas Lighthouse aprovados localmente.

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

| Conta  | E-mail                    | Senha       |
| ------ | ------------------------- | ----------- |
| Demo 1 | `demo@aurora.dev`         | `Demo123!`  |
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
4. Ambiente: `VITE_ENABLE_MOCKS=true`. Deixe `VITE_SOCKET_URL` sem definir para usar a origem do site.
5. Teste diretamente `/nft/nft-01` e `/cart` após refresh. `vercel.json` garante SPA fallback.

Não confunda o `VITE_SOCKET_URL` com um servidor de rede existente: o Service Worker / interceptação MSW deve capturar o WebSocket simulado conforme a compatibilidade da biblioteca instalada.

## Layout

**Visual atualizado:** a referência foi extraída dos prints desktop/mobile enviados: identidade KURIO, cores cobre/marrom, novo layout da página inicial, sidebar desktop, grade mobile e retratos locais. As imagens de personagens são RECORTES DOS PRINTS, não assets originais do Figma, e possuem resolução limitada. O restante das telas reutiliza o tema mas precisa de uma conferência visual comparando cada frame. Exportar imagens originais do Figma antes da entrega final, se possível.

## Resultados comprovados - 14/10/2026

- Build TypeScript/Vite: aprovado.
- Playwright desktop 1440px: 12/12.
- Playwright mobile 390px: 12/12.
- Regressão visual: 8/8, baselines versionadas.
- GitHub: https://github.com/JT-Moreira/kurio-nft-marketplace
- Deploy: https://kurio-nft-marketplace-weld.vercel.app/

### Lighthouse - mediana de 3 medições por cenário

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO |
| ------- | ------- | ----------: | ------------: | -------------: | --: |
| Home    | Mobile  |          90 |           100 |             96 |  92 |
| Home    | Desktop |          99 |           100 |             96 |  92 |
| Detalhe | Mobile  |          91 |           100 |             96 |  92 |
| Detalhe | Desktop |         100 |           100 |             96 |  92 |

LCP / CLS / TBT:

- Home mobile: 3244ms / 0.000027 / 149ms.
- Home desktop: 880ms / 0.000004 / 4ms.
- Detalhe mobile: 2630ms / 0.087706 / 172ms.
- Detalhe desktop: 715ms / 0.040985 / 0ms.

Relatórios HTML/JSON gerados localmente em `lighthouse-reports/`.
Auditoria executada no build de produção local.

## Limitações e verificações pendentes

- Pagamentos, carteiras e autenticação são simulados.
- Reconexão Socket.IO, eventos antigos e duplicados não possuem testes E2E específicos comprovados.
- Viewport de 768px ainda não foi verificado separadamente.
- Fluxo completo no domínio público não foi automatizado.
- Algumas imagens são recortes provisórios do Figma.
- Baselines visuais foram geradas no Chromium para Windows.
- Os testes aprovados não cobrem todos os cenários avançados do desafio.

## Contexto do desenvolvimento e aprendizado

O KURIO foi desenvolvido como meu primeiro projeto web completo, a partir de um desafio técnico para uma oportunidade profissional na área de tecnologia.

Meu objetivo foi ir além de uma interface visual e compreender as etapas necessárias para construir, testar e publicar uma aplicação web funcional. O projeto utiliza React, TypeScript, roteamento, gerenciamento de estado, APIs REST simuladas, testes automatizados e ferramentas de auditoria de desempenho.

### Processo de desenvolvimento

O desenvolvimento foi conduzido de maneira incremental, com consultas à documentação técnica e utilização de ferramentas de inteligência artificial como apoio à implementação, depuração e revisão.

Durante esse processo, trabalhei na configuração do ambiente, execução e análise de testes, investigação de erros de renderização, ajustes de testes para interfaces responsivas, versionamento com Git, publicação no GitHub e Vercel e validação dos resultados.

Entre os principais aprendizados estiveram a importância de não considerar uma aplicação concluída apenas porque sua interface aparece corretamente, a necessidade de tratar operações assíncronas e a diferença entre testes funcionais, regressão visual e auditorias de desempenho.

### Validação e resultados

O projeto passou pelo build de produção e por 24 testes funcionais com Playwright, distribuídos entre desktop e mobile. Também foram aprovadas oito comparações visuais automatizadas.

As auditorias Lighthouse atingiram as metas estabelecidas para Performance, Accessibility, Best Practices e SEO nos cenários avaliados.

Além disso, realizei verificações no domínio público, incluindo a conclusão manual de uma compra simulada com geração de recibo e a checagem de ausência de overflow horizontal em três páginas na largura de 768 px.

Os resultados detalhados e os comandos de reprodução estão documentados nas seções anteriores.

### Limitações e próximos passos

Reconheço que o projeto ainda possui pontos que poderiam ser aprimorados, a cobertura automatizada de cenários avançados de Socket.IO e as validações de concorrência e reconexão.

As integrações de pagamento, autenticação e carteira são demonstrativas, conforme o escopo do desafio, e não representam serviços financeiros reais.

Este projeto marca uma etapa importante da minha formação prática. Mais do que apresentar uma aplicação publicada, meu objetivo foi desenvolver familiaridade com ferramentas e processos profissionais de desenvolvimento, identificar problemas concretos e aprender a validar soluções de maneira reproduzível.
