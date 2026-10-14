import { test,expect,type Page } from '@playwright/test'
/** Garante um banco de mocks limpo e determinístico por teste. */
async function reset(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    localStorage.removeItem('aurora_mock_database_v1')
    localStorage.removeItem('aurora_session_token')
    localStorage.removeItem('aurora_coupon')
    localStorage.removeItem('aurora_guest_id')
    localStorage.setItem('aurora_scenario', 'default')
    sessionStorage.clear()
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: /SEJA DONO DO FUTURO/i })).toBeVisible()
}

/** Abre uma obra pela busca do catálogo, sem depender da ordem da paginação. */
async function addFirst(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const search = page.getByPlaceholder('Busque arte, coleção ou criador...')
  await search.fill('Emerald Ape #042')
  const nftLink = page.getByRole('link', { name: 'Ver Emerald Ape #042' })
  await expect(nftLink).toBeVisible({ timeout: 10000 })
  await nftLink.click()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByRole('heading', { name: 'Meu carrinho' })).toBeVisible()
}

async function signIn(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('E-mail', { exact: true }).fill('demo@aurora.dev')
  await page.getByLabel('Senha', { exact: true }).fill('Demo123!')
  await page.getByRole('button', { name: 'Entrar na conta' }).click()
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible()
}
test.beforeEach(async({page})=>reset(page))

test('busca, filtros, paginação e histórico de URL',async({page})=>{
 await page.getByPlaceholder('Busque arte, coleção ou criador...').fill('Emerald');await expect(page).toHaveURL(/q=Emerald/);await expect(page.getByText('Emerald Ape #042').first()).toBeVisible();if (await page.getByRole('button',{name:'Exibir filtros'}).isVisible()) { await page.getByRole('button',{name:'Exibir filtros'}).click() };await page.getByRole('combobox',{name:'Filtrar categoria'}).selectOption('Arte');await expect(page).toHaveURL(/category=Arte/);await page.getByPlaceholder('Busque arte, coleção ou criador...').fill('');await expect(page.getByText('NFTs encontrados')).toBeVisible();await page.goBack();await expect(page).toHaveURL(/q=Emerald/)
})
test('detalhe direto e NFT inexistente',async({page})=>{await page.goto('/nft/nft-01');await expect(page.getByRole('heading',{name:'Emerald Ape #042'})).toBeVisible();await page.goto('/nft/nao-existe');await expect(page.getByText('NFT não encontrado.')).toBeVisible()})
test('carrinho sobrevive refresh e calcula cupom pela API',async({page})=>{await addFirst(page);await expect(page.getByRole('heading',{name:'Meu carrinho'})).toBeVisible();await page.reload();await expect(page.getByText('Emerald Ape #042').first()).toBeVisible();await page.getByPlaceholder('Código de desconto').fill('AURORA10');await page.getByRole('button',{name:'Aplicar'}).click();await expect(page.getByText('Desconto', { exact: true })).toBeVisible()})
test('login recupera carrinho de visitante e logout protege a conta',async({page})=>{
 await addFirst(page)
 await signIn(page)
 await page.goto('/cart')
 await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
 const mobileMenu = page.getByRole('button',{name:'Abrir navegação'})
if (await mobileMenu.isVisible()) {
  await mobileMenu.click()
  await page.getByRole('button',{name:'Sair',exact:true}).click()
} else {
  await page.getByRole('button',{name:'Sair da conta'}).click()
}
 // Verify the credential really disappears before testing access to a private route.
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('aurora_session_token'))).toBeNull()
 if (await mobileMenu.isVisible()) await mobileMenu.click()
await expect(page.getByRole('link',{name:'Entrar',exact:true})).toBeVisible()
 await page.goto('/profile')
 await expect(page).toHaveURL(/\/login/)
 await expect(page.getByRole('heading',{name:'Acesse sua conta'})).toBeVisible()
})
test('compra simulada passa por pending e recibo confirmado',async({page})=>{await signIn(page);await addFirst(page);await page.getByRole('link',{name:/Finalizar compra/}).click();await page.getByRole('button',{name:'Conectar \(simulado\)'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:/Confirmar pedido/}).click();await expect(page).toHaveURL(/\/orders\/ord-/);await expect(page.getByRole('heading',{name:'Compra confirmada!'})).toBeVisible({timeout:15000});await expect(page.getByText('Recibo da transação')).toBeVisible()})
test('preço alterado na API é refletido no detalhe e no carrinho',async({page})=>{
 await signIn(page)
 await addFirst(page)
 await page.goto('/nft/nft-01')
 // Antes havia uma corrida: o teste navegava antes de a requisição POST terminar.
 // Aguarde a resposta real da API e a sincronização do cache (nada de sleep fixo).
 const updatedResponse=page.waitForResponse(response=>
  response.url().includes('/api/demo/nfts/nft-01/change') &&
  response.request().method()==='POST'
 )
 await page.getByRole('button',{name:/Simular alteração de preço/}).click()
 const response=await updatedResponse
 expect(response.status()).toBe(200)
 const updated=await response.json() as {id:string;price:string;version:number}
 expect(updated.id).toBe('nft-01')
 expect(updated.version).toBeGreaterThan(1)
 const price=`${Number(updated.price).toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:6})} ETH`
 await expect(page.getByText('Preço alterado pela API simulada.', { exact: true })).toBeVisible()
 await expect(page.getByText(price).first()).toBeVisible()
 await page.goto('/cart')
 await expect(page.getByRole('heading',{name:'Meu carrinho'})).toBeVisible()
 await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()
 await expect(page.getByText(price).first()).toBeVisible({timeout:10000})
})
test('perfil e carteiras funcionam',async({page})=>{await signIn(page);await page.goto('/profile');await page.getByLabel('Nome',{exact:true}).fill('Alex Teste');await page.getByRole('button',{name:'Salvar dados'}).click();await expect(page.getByText('Dados atualizados com sucesso.')).toBeVisible();await page.goto('/wallets');await expect(page.getByText('Minha carteira principal').first()).toBeVisible()})
test('navegação principal acessível por teclado',async({page})=>{
  // Inicia em um ponto estável da ordem de tabulação e percorre com Tab real.
  await page.getByRole('link',{name:'KURIO'}).focus()
  await page.keyboard.press('Tab')
  const mobileMenu = page.getByRole('button',{name:'Abrir navegação'})
if (await mobileMenu.isVisible()) {
  await expect(page.getByRole('link',{name:/Carrinho com \d+ itens/})).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(mobileMenu).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('link',{name:'Explorar',exact:true})).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link',{name:'Explorar',exact:true})).toBeFocused()
  await page.getByRole('button',{name:'Exibir filtros'}).click()
} else {
  await expect(page.getByRole('link',{name:'Início',exact:true})).toBeFocused()
}
  await page.getByRole('combobox',{name:'Filtrar categoria'}).focus()
  await expect(page.getByRole('combobox',{name:'Filtrar categoria'})).toBeFocused()
})
test('cupom expirado apresenta erro e permite recuperação',async({page})=>{await addFirst(page);await page.getByPlaceholder('Código de desconto').fill('OLD10');await page.getByRole('button',{name:'Aplicar'}).click();await expect(page.getByText('Cupom expirado.')).toBeVisible();await page.getByRole('button',{name:/Remover cupom/}).click();await expect(page.getByText('Resumo da compra')).toBeVisible()})
test('cadastro duplicado retorna conflito de API',async({page})=>{await page.goto('/register');await page.getByLabel('Nome',{exact:true}).fill('Outro Colecionador');await page.getByLabel('E-mail',{exact:true}).fill('demo@aurora.dev');await page.getByLabel('Senha',{exact:true}).fill('SenhaExemplo123!');await page.getByLabel('Confirmar senha').fill('SenhaExemplo123!');await page.getByRole('button',{name:'Criar conta'}).click();await expect(page.getByText('E-mail já cadastrado.')).toBeVisible()})
test('alteração de preço no checkout exige nova revisão',async({page})=>{
 await signIn(page)
 await addFirst(page)
 await page.goto('/checkout')
 await page.getByRole('button',{name:'Conectar \(simulado\)'}).click()
 // Aguarda a cotação inicial antes de assinalar a revisão.
 await expect(page.getByRole('button',{name:/Confirmar pedido/})).toBeDisabled()
 const review=page.getByRole('checkbox')
 await review.check()
 await expect(page.getByRole('button',{name:/Confirmar pedido/})).toBeEnabled()
 const responseStatus=await page.evaluate(async()=>{
  const response=await fetch('/api/demo/nfts/nft-01/change',{method:'POST'})
  return response.status
 })
 expect(responseStatus).toBe(200)
 await expect(page.getByRole('alert')).toContainText('O preço ou a disponibilidade mudou',{timeout:12000})
 await expect(review).not.toBeChecked()
 await expect(page.getByRole('button',{name:/Confirmar pedido/})).toBeDisabled()
})
test('pagamento recusado não produz confirmação',async({page})=>{await signIn(page);await addFirst(page);await page.evaluate(()=>localStorage.setItem('aurora_scenario','payment-declined'));await page.goto('/checkout');await page.getByRole('button',{name:'Conectar \(simulado\)'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:/Confirmar pedido/}).click();await expect(page).toHaveURL(/\/orders\/ord-/);await expect(page.getByRole('heading',{name:'Pagamento recusado'})).toBeVisible({timeout:15000});await page.goto('/cart');await expect(page.getByText('Emerald Ape #042').first()).toBeVisible()})
