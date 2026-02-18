'use client'

import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useEffect, useState } from 'react'

export function SearchInput({ defaultValue }: { defaultValue: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [value, setValue] = useState(defaultValue)

    // Debounce manual para evitar múltiplas requisições ao digitar
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value === defaultValue) return

            const params = new URLSearchParams(searchParams)
            if (value) {
                params.set('q', value)
            } else {
                params.delete('q')
            }

            startTransition(() => {
                router.push(`/chords?${params.toString()}`)
            })
        }, 400) // 400ms de atraso

        return () => clearTimeout(timeout)
    }, [value, router, searchParams, defaultValue])

    return (
        <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                {isPending ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                    <Search className={`h-4 w-4 transition-colors ${value ? 'text-blue-500' : 'text-muted-foreground'}`} />
                )}
            </div>
            <Input
                type="search"
                placeholder="Buscar por título, artista..."
                className="pl-10 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    )
}
