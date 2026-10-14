import axios from 'axios'
import type { CartViewItem, CatalogPage, CatalogParams, Nft, Order, Quote, User, Wallet, Network } from '../types'

const TOKEN='aurora_session_token'
const GUEST='aurora_guest_id'
export const getToken=()=>localStorage.getItem(TOKEN)
export function getGuestId(){let id=localStorage.getItem(GUEST);if(!id){id=crypto.randomUUID();localStorage.setItem(GUEST,id)}return id}
export function setToken(token:string|null){if(token)localStorage.setItem(TOKEN,token);else localStorage.removeItem(TOKEN);window.dispatchEvent(new Event('aurora-auth'))}
export const client=axios.create({baseURL:'/api',timeout:5000})
client.interceptors.request.use(config=>{const token=getToken();if(token)config.headers.set('Authorization',`Bearer ${token}`);config.headers.set('x-guest-id',getGuestId());return config})
client.interceptors.response.use(response=>response,error=>{if(axios.isAxiosError(error)&&error.response?.status===401&&getToken() && !String(error.config?.url).includes('/auth/login'))setToken(null);return Promise.reject(error)})
export function msg(error:unknown){if(axios.isAxiosError(error))return (error.response?.data as {message?:string})?.message|| (error.code==='ECONNABORTED'?'A solicitação demorou demais. Tente recuperar a tentativa.':'Falha de conexão. Tente novamente.');return 'Algo deu errado. Tente novamente.'}
export const api={
 nfts:async(p:CatalogParams,signal?:AbortSignal)=>(await client.get<CatalogPage>('/nfts',{params:p,signal})).data,
 nft:async(id:string,signal?:AbortSignal)=>(await client.get<Nft>(`/nfts/${id}`,{signal})).data,
 session:async()=>(await client.get<User>('/auth/session')).data,
 login:async(email:string,password:string)=>(await client.post<{token:string;user:User}>('/auth/login',{email,password,guestId:getGuestId()})).data,
 register:async(name:string,email:string,password:string)=>(await client.post('/auth/register',{name,email,password})).data,
 logout:async(token:string)=>{await client.post('/auth/logout',undefined,{headers:{Authorization:`Bearer ${token}`}})},
 favorites:async()=>(await client.get<string[]>('/favorites')).data,
 favorite:async(id:string,yes:boolean)=>(await client.request<string[]>({url:`/favorites/${id}`,method:yes?'PUT':'DELETE'})).data,
 cart:async()=>(await client.get<CartViewItem[]>('/cart')).data,
 setCart:async(id:string,quantity:number)=>(await client.put<CartViewItem[]>(`/cart/${id}`,{quantity})).data,
 quote:async(coupon:string|null,network:Network)=>(await client.post<Quote>('/quote',{coupon,network})).data,
 profile:async()=>(await client.get<User>('/profile')).data,
 updateProfile:async(p:{name:string;avatar:string})=>(await client.patch<User>('/profile',p)).data,
 password:async(oldPassword:string,newPassword:string)=>(await client.post('/profile/password',{oldPassword,newPassword})).data,
 wallets:async()=>(await client.get<Wallet[]>('/wallets')).data,
 addWallet:async(w:Omit<Wallet,'id'>)=>(await client.post<Wallet>('/wallets',w)).data,
 editWallet:async(id:string,p:Partial<Wallet>)=>(await client.patch<Wallet>(`/wallets/${id}`,p)).data,
 createOrder:async(quote:Quote,walletId:string,key:string,collector:{name:string;email:string})=>(await client.post<Order>('/orders',{quote,walletId,collector},{headers:{'idempotency-key':key},timeout:5000})).data,
 order:async(id:string)=>(await client.get<Order>(`/orders/${id}`)).data,
 orderByKey:async(key:string)=>(await client.get<Order>(`/orders/by-key/${key}`)).data,
 orders:async()=>(await client.get<Order[]>('/orders')).data,
 triggerChange:async(id:string)=>(await client.post<Nft>(`/demo/nfts/${id}/change`)).data,
 sellout:async(id:string)=>(await client.post<Nft>(`/demo/nfts/${id}/sellout`)).data,
 reset:async()=>{await client.post('/demo/reset')},
 expire:async()=>{await client.post('/demo/expire')}
}
