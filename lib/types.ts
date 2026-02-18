export interface Ministry {
    id: string
    name: string
    invite_code: string
    created_at: string
}

export interface Profile {
    id: string
    name: string
    ministry_id: string | null
    is_admin: boolean
    created_at: string
}

export interface Chord {
    id: string
    ministry_id: string
    created_by: string
    title: string
    artist: string
    original_tonality: string
    lyrics_chords: string
    created_at: string
    updated_at: string
}

export interface Favorite {
    user_id: string
    chord_id: string
    created_at: string
}

export interface ChordWithFavorite extends Chord {
    is_favorite: boolean
}
