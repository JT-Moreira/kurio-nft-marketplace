import { useEffect, useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, ArrowRight, SlidersHorizontal, ShieldCheck, Palette, BellRing } from 'lucide-react'
import { api, msg } from '../api/client'
import { NFTCard, Skeleton, StateError } from '../components/common'
import { Button } from '../components/ui/button'
import { useAuth, useFavorites, useToggleFavorite } from '../hooks/useApp'
import { indexRoute } from '../router'
import type { CatalogParams } from '../types'

const categories=['','Arte','3D','Fotografia','Música']
const networks=['','Ethereum','Polygon','Base']
const searchDefaults={q:'',category:'',network:'',sort:'recent' as const,page:1}
export function Discover(){
 const search=indexRoute.useSearch(), navigate=useNavigate({from:'/'}),[draft,setDraft]=useState(search.q),[notice,setNotice]=useState(''),[showFilters,setShowFilters]=useState(false)
 const {user}=useAuth(), favorites=useFavorites(user?.id), toggle=useToggleFavorite(user?.id)
 const catalog=useQuery({queryKey:['nfts',search],queryFn:({signal})=>api.nfts(search,signal),placeholderData:previous=>previous})
 useEffect(()=>setDraft(search.q),[search.q])
 useEffect(()=>{if(draft===search.q)return;const timer=setTimeout(()=>void navigate({search:old=>({...old,q:draft,page:1}),replace:true}),300);return()=>clearTimeout(timer)},[draft,navigate,search.q])
 const update=(patch:Partial<CatalogParams>)=>void navigate({search:old=>({...old,...patch,page:patch.page??1})})
 const favorite=(id:string,yes:boolean)=>{if(!user){setNotice('Entre na conta para salvar favoritos.');return}toggle.mutate({id,yes},{onError:error=>setNotice(msg(error))})}
 return <div className="kurio-discover">
  <section className="kurio-hero" aria-labelledby="hero-title">
   <div className="kurio-hero-copy"><p className="kurio-overline">Bem-vindo ao Kurio</p><h1 id="hero-title">SEJA DONO DO FUTURO<br/>DA ARTE DIGITAL</h1><p>Descubra NFTs selecionados por criadores independentes. Explore, colecione e encontre obras que transformam a arte digital.</p><a href="#explorar" className="kurio-action">EXPLORAR <ArrowRight size={14}/></a><p className="kurio-hero-dots" aria-hidden="true">● <span>●</span> <span>●</span></p></div>
   <img src="/art/kurio-emerald.webp" alt="Emerald Ape, macaco de óculos com jaqueta verde" className="kurio-hero-image" width="512" height="512"/>
  </section>
  <div className="kurio-main-layout" id="explorar">
   <aside className={`kurio-sidebar ${showFilters?'kurio-sidebar-open':''}`} aria-label="Filtros do catálogo">
    <div className="kurio-sidebar-title"><span>Coleções</span><button onClick={()=>{setDraft('');update(searchDefaults)}}>Limpar</button></div>
    <div className="kurio-sidebar-cats">{categories.slice(1).map(category=><button key={category} aria-pressed={search.category===category} onClick={()=>update({category:search.category===category?'':category})}><span>{category==='Arte'?'Arte digital':category==='3D'?'Arte 3D':category}</span><span>↗</span></button>)}</div>
    <label className="kurio-sidebar-title" htmlFor="sort">Ordenar por</label><select id="sort" aria-label="Ordenar catálogo" value={search.sort} onChange={e=>update({sort:e.target.value})}><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="title">Título A–Z</option></select>
    <label className="kurio-sidebar-title" htmlFor="category">Categoria</label><select id="category" aria-label="Filtrar categoria" value={search.category} onChange={e=>update({category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c||'Todas as coleções'}</option>)}</select>
    <label className="kurio-sidebar-title" htmlFor="network">Rede</label><select id="network" aria-label="Filtrar rede" value={search.network} onChange={e=>update({network:e.target.value})}>{networks.map(n=><option key={n} value={n}>{n||'Todas as redes'}</option>)}</select>
   </aside>
   <section className="kurio-catalog" aria-label="Mercado de NFTs">
    <div className="kurio-catalog-toolbar"><div className="kurio-tabs"><span className="kurio-tab-active">Todos os NFTs</span><span>Novos lançamentos</span><span>Em alta</span></div><label className="kurio-search"><Search size={15}/><span className="sr-only">Pesquisar NFTs</span><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Busque arte, coleção ou criador..."/></label><button className="kurio-filter-toggle" aria-label="Exibir filtros" aria-expanded={showFilters} onClick={()=>setShowFilters(v=>!v)}><SlidersHorizontal size={18}/></button></div>
    {notice&&<p role="status" className="kurio-notice">{notice}</p>}
    <div className="kurio-results-line"><span>{catalog.data?.total??'...'} NFTs encontrados</span>{catalog.isFetching&&<span role="status">Atualizando resultados...</span>}</div>
    {catalog.isPending?<Skeleton count={8}/>:catalog.isError?<StateError error={catalog.error} retry={()=>void catalog.refetch()}/>:catalog.data!.items.length?<div className="kurio-nft-grid">{catalog.data!.items.map(nft=><NFTCard key={nft.id} nft={nft} fav={favorites.data?.includes(nft.id)} onFavorite={favorite}/>)}</div>:<div className="surface p-12 text-center"><h2 className="text-xl font-bold">Nenhuma obra encontrada</h2><p className="muted mt-2">Tente outros filtros ou palavras.</p><Button className="mt-5" onClick={()=>{setDraft('');update(searchDefaults)}}>Limpar filtros</Button></div>}
    {catalog.data&&catalog.data.pages>1&&<nav aria-label="Paginação" className="kurio-pagination"><Button variant="secondary" disabled={search.page<=1} onClick={()=>update({page:search.page-1})}>Anterior</Button><span>Página {search.page} de {catalog.data.pages}</span><Button variant="secondary" disabled={search.page>=catalog.data.pages} onClick={()=>update({page:search.page+1})}>Próxima</Button></nav>}
   </section>
  </div>
  <section className="kurio-editorial" aria-label="Mais colecionadores"><div className="kurio-editorial-card"><img src="/art/kurio-emerald.webp" width="240" height="240" alt="Macaco da coleção Emerald"/><div><h2>Encontre novos mundos em cada coleção</h2><p>Criações únicas, edições limitadas e histórias para colecionar.</p><a href="#explorar">EXPLORAR COLEÇÃO <ArrowRight size={13}/></a></div></div><div className="kurio-editorial-card"><img src="/art/kurio-ivory.webp" width="240" height="240" alt="Macaco da coleção Ivory"/><div><h2>Arte digital selecionada para você</h2><p>Curadoria pensada para quem enxerga além do comum.</p><a href="#explorar">DESCOBRIR NFTs <ArrowRight size={13}/></a></div></div></section>
  <section className="kurio-journal"><h2>Diário da Cunhagem</h2><p>Histórias, arte e cultura do colecionismo no universo digital.</p><div className="kurio-journal-grid">{[{title:'Coleções que atravessam gerações',pic:'ivory'},{title:'Um olhar sobre a nova arte digital',pic:'emerald'},{title:'Além do retrato: a personalidade da obra',pic:'cosmic'},{title:'Criadores e suas inspirações',pic:'violet'}].map(card=><article key={card.title}><img src={`/art/kurio-${card.pic}.webp`} alt="" loading="lazy" width="320" height="200"/><h3>{card.title}</h3><p>Conheça novas expressões e encontre sua próxima peça favorita.</p></article>)}</div></section>
  <section className="kurio-benefits"><div><ShieldCheck size={28}/><h3>Segurança da carteira</h3><p>Simulação de transações para uma experiência segura.</p></div><div><Palette size={28}/><h3>Criadores em destaque</h3><p>Descubra coleções e artistas em uma curadoria especial.</p></div><div><BellRing size={28}/><h3>Alertas de lançamento</h3><p>Acompanhe suas coleções favoritas e as novidades.</p></div><div><h3>Antecipe-se ao próximo lançamento</h3><p>Uma prévia do universo Kurio.</p><Link to="/register" className="kurio-action">CRIAR CONTA <ArrowRight size={14}/></Link></div></section>
 </div>
}
