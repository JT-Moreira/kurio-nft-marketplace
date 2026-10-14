import type { CartItem, Nft, Order, User, Wallet } from '../types'
export type Account = User & { passwordHash: string }
export type Db = { nfts: Nft[]; users: Account[]; wallets: Record<string, Wallet[]>; favorites: Record<string,string[]>; carts: Record<string, CartItem[]>; sessions: Record<string,{ userId: string; expiresAt: number }>; orders: Order[]; attempts: Record<string,{ fingerprint: string; orderId:string }> }
const STORAGE = 'aurora_mock_database_v1'
const names = ['Emerald Ape #042','Violet Nomad #314','Ivory Baron #088','Golden Beat #207','Emerald Series #044','Violet Circuit #011','Ivory Dream #089','Golden Signal #168','Cosmic Bloom #118','Violet Nomad #214','Ivory Baron #090','Golden Signal #207','Emerald Ape #052','Cosmic Bloom #122','Ivory Baron #103','Golden Frequency #071','Emerald Ape #059','Violet Soul #014','Ivory Legacy #120','Golden Beat #301','Emerald Muse #020','Cosmic Nomad #045','Ivory Signal #219','Golden Horizon #089']
const categories: Nft['category'][]=['Arte','3D','Fotografia','Música']
const networks: Nft['network'][]=['Ethereum','Polygon','Base']
const baseUser = (id:string,name:string,email:string,hash:string):Account=>({id,name,email,passwordHash:hash,avatar:'/art/nft-08.svg'})
export function seedDb():Db {
 const nfts = names.map((title,i): Nft => ({ id:`nft-${String(i+1).padStart(2,'0')}`,title,creator:['@cosmic','@nova','@ether','@kai'][i%4],description:'Uma peça exclusiva do universo Kurio. Edição limitada, cunhada na rede e selecionada para colecionadores de arte digital.',category:categories[i%4],network:networks[i%3],price:(1.19+(i%8)*0.20).toFixed(3),supply:(i%5)+2,image:`/art/kurio-${['emerald','cosmic','ivory','violet'][i%4]}.webp`,edition:`${(i%5)+2} edições`,version:1,featured:i<4 }))
 const users = [baseUser('u1','Alex Morgan','demo@aurora.dev','5dcbcc64a9d124ae887f5a7f18d812479bdb8da4e628928d0e0d96d39f70140a'),baseUser('u2','Sam Rivera','colecionador@aurora.dev','60dd13132e8d0d3ee8c4d04353d6a2f57f050a1039f17af61457c38bcf888d52')]
 return {nfts, users, carts:{},favorites:{u1:[],u2:[]},sessions:{},orders:[],attempts:{}, wallets:{u1:[{id:'w1',label:'Minha carteira principal',address:'0x1234567890abcdef1234567890abcdef12345678',network:'Ethereum',primary:true}],u2:[{id:'w2',label:'Minha carteira',address:'0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',network:'Polygon',primary:true}]}}
}
export function getDb():Db {try { const raw=localStorage.getItem(STORAGE);return raw?JSON.parse(raw) as Db:seedDb() } catch {return seedDb()}}
export function putDb(db:Db){localStorage.setItem(STORAGE,JSON.stringify(db))}
export function resetDb(){const fresh=seedDb();putDb(fresh);return fresh}
export function getScenario(){return localStorage.getItem('aurora_scenario')||'default'}
