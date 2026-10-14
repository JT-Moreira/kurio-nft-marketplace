import * as React from 'react'
import { cn } from './button'
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({className,...props},ref)=><input ref={ref} className={cn('w-full min-h-11 rounded-xl border border-white/15 bg-white/[.045] px-4 py-2.5 text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50',className)} {...props}/>)
Input.displayName='Input'
