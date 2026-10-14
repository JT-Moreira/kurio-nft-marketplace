import { useEffect, useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import type { NftUpdate, OrderUpdate } from '../types'
import { api, getToken, setToken } from '../api/client'

const subscribe=(listener:()=>void)=>{window.addEventListener('aurora-auth',listener);return ()=>window.removeEventListener('aurora-auth',listener)}
export function useAuth(){const token=useSyncExternalStore(subscribe,getToken,()=>null);const q=useQuery({queryKey:['session',token],queryFn:api.session,enabled:!!token,retry:false,staleTime:60_000});return {token,user:token?q.data:null,isLoading:!!token&&q.isPending}}
export function useLogout(){
 const qc=useQueryClient()
 return async()=>{
  // Clear local credentials synchronously so refresh/navigation cannot resurrect the session.
  const oldToken=getToken()
  setToken(null)
  qc.clear()
  sessionStorage.removeItem('aurora_checkout_attempt')
  // Best-effort server-side revocation: the saved token must be sent explicitly.
  if(oldToken){try{await api.logout(oldToken)}catch{ /* offline logout still invalidates local access */ }}
 }
}
export function useCart(){return useQuery({queryKey:['cart',getToken()||'guest'],queryFn:api.cart,staleTime:5000})}
export function useSetCart(){const qc=useQueryClient();return useMutation({mutationFn:({id,quantity}:{id:string;quantity:number})=>api.setCart(id,quantity),onSuccess:()=>{void qc.invalidateQueries({queryKey:['cart']});void qc.invalidateQueries({queryKey:['quote']})}})}
export function useWallets(userId?:string){return useQuery({queryKey:['wallets',userId],queryFn:api.wallets,enabled:!!userId})}
export function useFavorites(userId?:string){return useQuery({queryKey:['favorites',userId],queryFn:api.favorites,enabled:!!userId})}
export function useToggleFavorite(userId?:string){const qc=useQueryClient();return useMutation({mutationFn:({id,yes}:{id:string;yes:boolean})=>api.favorite(id,yes),onMutate:async({id,yes})=>{await qc.cancelQueries({queryKey:['favorites',userId]});const old=qc.getQueryData<string[]>(['favorites',userId]);qc.setQueryData<string[]>(['favorites',userId],(current=[])=>yes?[...new Set([...current,id])]:current.filter(f=>f!==id));return {old}},onError:(_err,_vars,context)=>qc.setQueryData(['favorites',userId],context?.old),onSettled:()=>{void qc.invalidateQueries({queryKey:['favorites',userId]})}})}
export function useRealtime(userId?:string){const qc=useQueryClient()
 useEffect(()=>{
  // Mesma origem do site por padrão: funciona tanto em localhost quanto sob HTTPS.
  // O cliente negocia ws:// ou wss:// automaticamente via socket.io-client.
  const socket=io(import.meta.env.VITE_SOCKET_URL||window.location.origin,{path:'/socket.io/',transports:['websocket'],reconnection:true,reconnectionDelay:650})
  const seenNfts=new Map<string,number>()
  const seenOrders=new Map<string,number>()
  const onNft=(event:NftUpdate)=>{
   const cached=qc.getQueryData<{version:number}>(['nft',event.resourceId]);if((seenNfts.get(event.resourceId)||0)>=event.version||(cached&&cached.version>=event.version))return
   seenNfts.set(event.resourceId,event.version)
   qc.setQueryData(['nft',event.resourceId],event.resource)
   void qc.invalidateQueries({queryKey:['nfts']});void qc.invalidateQueries({queryKey:['cart']});void qc.invalidateQueries({queryKey:['quote']})
  }
  const onOrder=(event:OrderUpdate)=>{if(event.userId!==userId||(seenOrders.get(event.resourceId)||0)>=event.version)return
   seenOrders.set(event.resourceId,event.version)
   void qc.invalidateQueries({queryKey:['order',userId,event.resourceId]});void qc.invalidateQueries({queryKey:['orders',userId]});void qc.invalidateQueries({queryKey:['cart']})
  }
  const onConnect=()=>{void qc.invalidateQueries({queryKey:['nfts']});void qc.invalidateQueries({queryKey:['cart']});if(userId){void qc.invalidateQueries({queryKey:['orders',userId]});void qc.invalidateQueries({queryKey:['favorites',userId]})}}
  socket.on('nft.updated',onNft);socket.on('order.updated',onOrder);socket.on('connect',onConnect)
  return ()=>{socket.off();socket.disconnect()}
 },[qc,userId])
}
export function clearPrivate(qc:QueryClient){qc.clear()}
