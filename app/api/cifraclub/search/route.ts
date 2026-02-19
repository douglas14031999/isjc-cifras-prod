import { NextRequest, NextResponse } from 'next/server';
import { searchCifraClub } from '@/lib/cifraclub';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const results = await searchCifraClub(query);
        return NextResponse.json(results);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
