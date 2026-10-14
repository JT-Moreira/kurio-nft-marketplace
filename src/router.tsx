import type React from 'react'
import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from '@tanstack/react-router'
import { AppLayout } from './components/common'
import { useAuth } from './hooks/useApp'
import { Discover } from './pages/Discover'
import { Detail } from './pages/Detail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { OrderPage } from './pages/Order'
import { Login, Register, Profile, Wallets } from './pages/Account'
import type { CatalogParams } from './types'

function Protected({children}:{children:React.ReactNode}){const {token,user,isLoading}=useAuth();if(!token)return <Navigate to="/login" search={{returnTo:window.location.pathname+window.location.search}}/>;if(isLoading)return <div role="status" className="shimmer h-64 rounded-3xl"/>;if(!user)return <Navigate to="/login" search={{returnTo:window.location.pathname+window.location.search}}/>;return <>{children}</>}
const rootRoute=createRootRoute({component:()=> <AppLayout><Outlet/></AppLayout>,notFoundComponent:()=> <div className="py-24 text-center"><h1 className="text-4xl font-black">404 · Página não encontrada</h1><p className="muted mt-4">O endereço não existe nesta coleção.</p></div>})
export const indexRoute=createRoute({getParentRoute:()=>rootRoute,path:'/',validateSearch:(raw:Record<string,unknown>):CatalogParams=>({q:typeof raw.q==='string'?raw.q:'',category:typeof raw.category==='string'?raw.category:'',network:typeof raw.network==='string'?raw.network:'',sort:typeof raw.sort==='string'?raw.sort:'recent',page:Math.max(1,Math.floor(Number(raw.page)||1))}),component:Discover})
export const nftRoute=createRoute({getParentRoute:()=>rootRoute,path:'/nft/$id',component:Detail})
export const cartRoute=createRoute({getParentRoute:()=>rootRoute,path:'/cart',component:Cart})
export const checkoutRoute=createRoute({getParentRoute:()=>rootRoute,path:'/checkout',component:()=> <Protected><Checkout/></Protected>})
export const orderRoute=createRoute({getParentRoute:()=>rootRoute,path:'/orders/$id',component:()=> <Protected><OrderPage/></Protected>})
export const loginRoute=createRoute({getParentRoute:()=>rootRoute,path:'/login',validateSearch:(s:Record<string,unknown>)=>({returnTo:typeof s.returnTo==='string'?s.returnTo:'/profile'}),component:Login})
export const registerRoute=createRoute({getParentRoute:()=>rootRoute,path:'/register',component:Register})
export const profileRoute=createRoute({getParentRoute:()=>rootRoute,path:'/profile',component:()=> <Protected><Profile/></Protected>})
export const walletsRoute=createRoute({getParentRoute:()=>rootRoute,path:'/wallets',component:()=> <Protected><Wallets/></Protected>})
const routeTree=rootRoute.addChildren([indexRoute,nftRoute,cartRoute,checkoutRoute,orderRoute,loginRoute,registerRoute,profileRoute,walletsRoute])
export const router=createRouter({routeTree,defaultPreload:'intent',scrollRestoration:true})
declare module '@tanstack/react-router'{interface Register{router:typeof router}}
