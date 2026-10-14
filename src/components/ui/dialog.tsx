import type React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export function DialogContent({children,title}:{children:React.ReactNode;title:string}){return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"/><DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border border-white/15 bg-[#26180e] p-6 shadow-2xl"><DialogPrimitive.Title className="text-xl font-bold">{title}</DialogPrimitive.Title><DialogPrimitive.Description className="sr-only">Configurações e ações da demonstração.</DialogPrimitive.Description><DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10" aria-label="Fechar"><X size={18}/></DialogPrimitive.Close><div className="mt-4">{children}</div></DialogPrimitive.Content></DialogPrimitive.Portal>}
