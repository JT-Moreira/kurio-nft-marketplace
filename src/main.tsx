import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import './styles.css'

/** A UI de diagnóstico evita o fundo vazio caso o MSW ou uma dependência falhe. */
const rootNode = document.getElementById('root')
if (!rootNode) throw new Error('Elemento #root não encontrado no index.html')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 8_000,
      retry: (count, error) => {
        const status = (error as { response?: { status?: number } }).response?.status
        return count < 1 && (!status || status >= 500)
      },
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
})

function showStartError(error: unknown) {
  console.error('[KURIO] Falha ao iniciar a aplicação:', error)
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  rootNode!.replaceChildren()
  const panel = document.createElement('main')
  Object.assign(panel.style, {
    maxWidth: '700px', margin: '12vh auto', padding: '32px', background: '#251810',
    border: '1px solid #d9904c', borderRadius: '8px', color: '#f3e8d6',
    fontFamily: 'system-ui, sans-serif', lineHeight: '1.6',
  })
  const title = document.createElement('h1')
  title.textContent = 'Não foi possível iniciar o KURIO'
  title.style.fontSize = '24px'
  const intro = document.createElement('p')
  intro.textContent = 'A instalação iniciou, mas ocorreu um erro no JavaScript. Copie o texto abaixo e envie no chat para corrigirmos.'
  const details = document.createElement('pre')
  details.textContent = message
  Object.assign(details.style, {whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:'16px',background:'#140c07',color:'#f4ab64'})
  const button = document.createElement('button')
  button.textContent = 'Copiar erro'
  Object.assign(button.style,{padding:'10px 18px',background:'#d9904c',color:'#1c1009',border:0,borderRadius:'4px',cursor:'pointer'})
  button.onclick = () => {void navigator.clipboard?.writeText(message)}
  panel.append(title, intro, details, button)
  rootNode!.append(panel)
}

function startupTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} não iniciou em ${ms / 1000} segundos. Verifique o Console (F12).`)), ms)
    promise.then(value => { window.clearTimeout(timer); resolve(value) }, error => { window.clearTimeout(timer); reject(error) })
  })
}

async function start() {
  rootNode!.textContent = 'Iniciando KURIO e preparando os dados de demonstração...'
  rootNode!.setAttribute('role', 'status')
  rootNode!.style.padding = '28px'

  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const { worker } = await import('./mocks/browser')
    await startupTimeout(worker.start({ onUnhandledRequest: 'bypass', quiet: true }), 9000, 'MSW (mock de rede)')
  }

  // Importamos as rotas APÓS iniciar o MSW para que Socket.IO use a interceptação.
  const { router } = await import('./router')
  rootNode!.removeAttribute('role')
  rootNode!.style.padding = ''
  rootNode!.replaceChildren()
  createRoot(rootNode!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

void start().catch(showStartError)
