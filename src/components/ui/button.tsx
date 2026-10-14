import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...v: Parameters<typeof clsx>) => twMerge(clsx(v))
const variants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] px-5 py-3 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc924a]', { variants: { variant: { default: 'bg-[#d88e4a] text-[#160e0a] hover:bg-[#f0aa63]', secondary: 'bg-[#2c1c13] text-[#e9d9bf] hover:bg-[#4a2a16]', outline: 'border border-white/20 bg-transparent text-white hover:border-[#d88e4a]', ghost: 'bg-transparent hover:bg-white/10 text-white', danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/30' }, size: { default: 'min-h-11', sm: 'min-h-9 px-3 py-2', lg: 'min-h-12 px-6' } }, defaultVariants: { variant: 'default', size: 'default' } })
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => <button ref={ref} className={cn(variants({ variant, size }), className)} {...props} />)
Button.displayName = 'Button'
