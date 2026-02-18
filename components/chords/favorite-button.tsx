'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
    chordId: string
    isFavorite: boolean
    userId: string
}

export function FavoriteButton({ chordId, isFavorite: initialIsFavorite, userId }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        const supabase = createClient()

        if (isFavorite) {
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('chord_id', chordId)
        } else {
            await supabase
                .from('favorites')
                .insert({ user_id: userId, chord_id: chordId })
        }

        setIsFavorite(!isFavorite)
        setLoading(false)
        router.refresh()
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            disabled={loading}
            className={`h-8 w-8 rounded-full transition-all ${isFavorite
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
        >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
    )
}
