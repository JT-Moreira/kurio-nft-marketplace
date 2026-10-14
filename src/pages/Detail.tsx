import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShieldCheck, Minus, Plus, ShoppingCart, RadioTower } from 'lucide-react'
import { api, msg } from '../api/client'
import { eth, PageHeading, StateError } from '../components/common'
import { Button } from '../components/ui/button'
import { useAuth, useCart, useFavorites, useSetCart, useToggleFavorite } from '../hooks/useApp'
import { nftRoute } from '../router'

export function Detail(){const {id}=nftRoute.useParams(),q=useQuery({queryKey:['nft',id],queryFn:({signal})=>api.nft(id,signal)}),{user}=useAuth(),favs=useFavorites(user?.id),toggle=useToggleFavorite(user?.id),add=useSetCart(),cart=useCart(),navigate=useNavigate(),queryClient=useQueryClient(),[simulating,setSimulating]=useState(false),[quantity,setQuantity]=useState(1),[notice,setNotice]=useState('');const nft=q.data
 if(q.isPending)return <><PageHeading eyebrow="Obra exclusiva" title="Carregando detalhe..."/><div className="grid gap-8 md:grid-cols-2"><div className="shimmer aspect-square rounded-3xl"/><div className="shimmer h-70 rounded-3xl"/></div></>
 if(q.isError)return <StateError error={q.error} retry={()=>void q.refetch()}/>
 if(!nft)return <p role="alert">NFT não encontrado.</p>
 const isFav=favs.data?.includes(nft.id)??false
 const favorite=()=>{if(!user){setNotice('Entre na conta para salvar favoritos.');return}toggle.mutate({id:nft.id,yes:!isFav},{onError:err=>setNotice(msg(err))})}
 const doCart=()=>add.mutate({id:nft.id,quantity:Math.min(nft.supply,quantity+(cart.data?.find(i=>i.nftId===nft.id)?.quantity||0))}, {onSuccess:()=>{setNotice('Obra adicionada ao carrinho!');void navigate({to:'/cart'})},onError:err=>setNotice(msg(err))})
 // Uma mutação REST deve atualizar todas as consultas dependentes, mesmo que o
 // evento Socket.IO atrase ou a conexão esteja temporariamente indisponível.
 // O feedback de sucesso só aparece depois que a API respondeu e o cache foi sincronizado.
 async function simulate(action:'price'|'sellout') {
  if(simulating)return
  setSimulating(true)
  setNotice('')
  try {
   const updated=action==='price'?await api.triggerChange(id):await api.sellout(id)
   queryClient.setQueryData(['nft',id],updated)
   await Promise.all([
    queryClient.invalidateQueries({queryKey:['nfts']}),
    queryClient.invalidateQueries({queryKey:['cart']}),
    queryClient.invalidateQueries({queryKey:['quote']}),
   ])
   setNotice(action==='price'?'Preço alterado pela API simulada.':'Edição esgotada pela API simulada.')
  }catch(error){setNotice(msg(error))}
  finally{setSimulating(false)}
 }
 return <><div className="mb-8 text-sm text-slate-400"><Link to="/" search={{q:'',category:'',network:'',sort:'recent',page:1}} className="hover:text-violet-300">Explorar</Link><span className="mx-2">/</span>{nft.title}</div><div className="grid gap-9 lg:grid-cols-[1fr_.9fr]"><div className="surface overflow-hidden p-3"><img className="aspect-square w-full rounded-2xl object-cover" src={nft.image} alt={`NFT ${nft.title}`} width="800" height="800"/><div className="flex gap-2 p-3"><img src={nft.image} alt="Vista principal" className="h-19 w-19 rounded-xl border border-violet-400 object-cover"/><p className="self-center text-xs text-slate-400">Galeria · 1 imagem disponível nesta edição</p></div></div><div className="py-2"><p className="label">{nft.category} · {nft.network}</p><h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{nft.title}</h1><p className="mt-3 text-slate-400">Criado por <span className="text-violet-300">{nft.creator}</span></p><p className="mt-7 max-w-lg leading-7 text-slate-300">{nft.description}</p><div className="surface my-7 p-6"><p className="text-sm text-slate-400">Preço por edição</p><p className="mt-1 text-4xl font-black">{eth(nft.price)}</p><p className="mt-3 text-sm text-slate-400">{nft.supply>0?`${nft.supply} unidade(s) disponíveis`:'Edição esgotada'}</p><div className="mt-6 flex flex-wrap items-center gap-3"><div className="flex items-center rounded-xl border border-white/15"><button aria-label="Diminuir quantidade" className="p-3" onClick={()=>setQuantity(q=>Math.max(1,q-1))} disabled={quantity<=1}><Minus size={16}/></button><output className="min-w-7 text-center" aria-label="Quantidade">{quantity}</output><button aria-label="Aumentar quantidade" className="p-3" onClick={()=>setQuantity(q=>Math.min(nft.supply,q+1))} disabled={quantity>=nft.supply}><Plus size={16}/></button></div><Button className="flex-1" onClick={doCart} disabled={!nft.supply||add.isPending}><ShoppingCart size={18}/>{add.isPending?'Adicionando...':'Adicionar ao carrinho'}</Button><Button variant="outline" aria-label={isFav?'Remover favorito':'Adicionar favorito'} onClick={favorite}><Heart size={19} fill={isFav?'#ec4899':'none'}/></Button></div>{notice&&<p role="status" className="mt-4 text-sm text-amber-300">{notice}</p>}</div><div className="grid gap-3 text-sm text-slate-400"><p><ShieldCheck className="mr-2 inline text-violet-300" size={18}/>Transação demonstrativa sem custos reais</p><p><RadioTower className="mr-2 inline text-violet-300" size={18}/>Preço e disponibilidade atualizados em tempo real</p><Button variant="ghost" disabled={simulating} onClick={()=>{void simulate('price')}} className="justify-start px-0 text-sm text-violet-300">Simular alteração de preço (teste)</Button><Button variant="ghost" disabled={simulating} onClick={()=>{void simulate('sellout')}} className="justify-start px-0 text-sm text-amber-300">Simular edição esgotada (teste)</Button></div></div></div></>}
