'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    width?: number
    height?: number
    showText?: boolean
    textClassName?: string
}

export function Logo({
    className,
    width = 32,
    height = 32,
    showText = true,
    textClassName
}: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative overflow-hidden flex items-center justify-center">
                <Image
                    src="/logo.svg"
                    alt="ISJC Cifras Logo"
                    width={width}
                    height={height}
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <span className={cn("font-bold text-xl tracking-tighter", textClassName)}>
                    ISJC Cifras
                </span>
            )}
        </div>
    )
}
