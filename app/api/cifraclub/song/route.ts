import { NextRequest, NextResponse } from 'next/server';
import { fetchCifraClubSong } from '@/lib/cifraclub';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const song = await fetchCifraClubSong(url);
        if (!song) {
            return NextResponse.json({ error: 'Song not found or failed to parse' }, { status: 404 });
        }
        return NextResponse.json(song);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
    }
}
