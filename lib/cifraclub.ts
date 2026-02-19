import * as cheerio from 'cheerio';

export interface CifraClubSong {
    title: string;
    artist: string;
    tonality: string;
    content: string;
    url: string;
}

export interface SearchResult {
    title: string;
    artist: string;
    url: string;
    thumbnail?: string;
    score?: number;
}


/**
 * Slugifies a string for Cifra Club URL construction.
 * Example: "Tempo de Semear" -> "tempo-de-semear"
 */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
        .replace(/\s+/g, '-')            // Spaces to hyphens
        .replace(/-+/g, '-')             // Collapse hyphens
        .trim();
}

/**
 * Formats a slug back into a human-readable name.
 * Example: "tempo-de-semear" -> "Tempo De Semear"
 */
function formatName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
};

const JUNK_SLUGS = [
    'letras', 'discografia', 'fotos', 'videos', 'playlists',
    'aprenda', 'enviar-cifra', 'contato', 'musicas.html',
    'top-musicas', 'estilos', 'novidades', 'blog', 'pro',
    'contribuicoes', 'login', 'cadastro', 'sobre', 'termos',
    'letra', 'musico', 'undefined'
];

/**
 * Searches for songs on Cifra Club by scraping artist pages.
 * 
 * Strategy:
 * 1. Slugify the query to construct a potential artist URL
 * 2. Fetch the artist page and extract song links
 * 3. If the query contains multiple words, try different slug combinations
 */
export async function searchCifraClub(query: string): Promise<SearchResult[]> {
    try {
        console.log(`[CifraClub] Searching for: ${query}`);
        const results: SearchResult[] = [];
        const seenPaths = new Set<string>();

        // Split query into potential artist and song parts
        const words = query.trim().split(/\s+/);
        const fullSlug = slugify(query);

        // Strategy 1: Smart Permutation (Best for "Artist Song" or "Song Artist" queries)
        // Try to construct a direct song URL by splitting words
        if (words.length >= 2) {
            // Try splitting at every position
            for (let split = 1; split < words.length; split++) {
                const partA = slugify(words.slice(0, split).join(' '));
                const partB = slugify(words.slice(split).join(' '));

                if (partA.length < 2 || partB.length < 2) continue;

                // Test A / B (Artist / Song)
                const url1 = `https://www.cifraclub.com.br/${partA}/${partB}/`;
                if (!seenPaths.has(url1)) {
                    if (await validateSongUrl(url1, partB)) {
                        seenPaths.add(url1);
                        results.push({
                            title: formatName(partB),
                            artist: formatName(partA),
                            url: url1,
                            score: 100 // High score for direct match
                        });
                    }
                }

                // Test B / A (Artist / Song - reversed)
                const url2 = `https://www.cifraclub.com.br/${partB}/${partA}/`;
                if (!seenPaths.has(url2)) {
                    if (await validateSongUrl(url2, partA)) {
                        seenPaths.add(url2);
                        results.push({
                            title: formatName(partA),
                            artist: formatName(partB),
                            url: url2,
                            score: 100 // High score for direct match
                        });
                    }
                }
            }
        }

        // Strategy 2: Try the full query as an artist slug
        const artistResults = await scrapeArtistPage(fullSlug);
        for (const r of artistResults) {
            if (!seenPaths.has(r.url)) {
                seenPaths.add(r.url);
                results.push({ ...r, score: 50 }); // Medium score
            }
        }

        // Strategy 3: Try each word as a potential artist slug
        if (results.length < 5 && words.length > 1) {
            for (const word of words) {
                const slug = slugify(word);
                if (slug.length < 3) continue;

                const wordResults = await scrapeArtistPage(slug);
                for (const r of wordResults) {
                    if (!seenPaths.has(r.url)) {
                        seenPaths.add(r.url);
                        results.push({ ...r, score: 10 }); // Low score
                    }
                }
                if (results.length > 20) break;
            }
        }

        // Filter results by relevance to the query
        const queryTerms = words.map(w => w.toLowerCase());
        const scored = results.map(r => {
            const titleLower = r.title.toLowerCase();
            const artistLower = r.artist.toLowerCase();
            let score = 0;
            for (const term of queryTerms) {
                if (titleLower.includes(term)) score += 2;
                if (artistLower.includes(term)) score += 1;
            }
            return { ...r, score };
        });

        // Sort by relevance score, then alphabetically
        scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

        const finalResults = scored.slice(0, 20);
        console.log(`[CifraClub] Found ${finalResults.length} results`);
        return finalResults;
    } catch (err) {
        console.error('[CifraClub] Search failure:', err);
        return [];
    }
}

/**
 * Scrapes an artist page on Cifra Club to extract their song list.
 */
async function scrapeArtistPage(artistSlug: string): Promise<SearchResult[]> {
    const url = `https://www.cifraclub.com.br/${artistSlug}/`;
    try {
        const response = await fetch(url, { headers: HEADERS });
        if (!response.ok) return [];

        const html = await response.text();
        const $ = cheerio.load(html);

        // Verify this is an artist page (has song links)
        const seen = new Set<string>();
        const results: SearchResult[] = [];
        const artistName = $('h1.t1').text().trim() || formatName(artistSlug);

        $('a').each((_i, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim();

            // Song links follow pattern /{artist}/{song}/
            if (href.startsWith(`/${artistSlug}/`) && href !== `/${artistSlug}/`) {
                const songSlug = href
                    .replace(`/${artistSlug}/`, '')
                    .replace(/\/$/, '');

                // Filter out junk, multi-segment paths and duplicates
                if (!songSlug || songSlug.includes('/') || songSlug.length < 2) return;
                if (JUNK_SLUGS.some(j => songSlug.includes(j))) return;
                if (seen.has(songSlug)) return;
                seen.add(songSlug);

                // Clean the display title
                // Cifra Club link text often has patterns like "Song Name0C" or "Song Name3G"
                const cleanTitle = text
                    .replace(/^\d+\s*/, '')         // Remove leading numbers (ranking)
                    .replace(/\d+[A-G](#|b)?m?$/, '') // Remove trailing tonality indicators
                    .replace(/\d+$/, '')             // Remove trailing numbers
                    .trim() || formatName(songSlug);

                results.push({
                    title: cleanTitle,
                    artist: artistName,
                    url: `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`
                });
            }
        });

        return results;
    } catch {
        return [];
    }
}

/**
 * Validates if a song URL exists and is not a redirect to the artist page.
 */
async function validateSongUrl(url: string, songSlug: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: 'HEAD', headers: HEADERS });
        if (!res.ok) return false;

        // Check if redirected URL still contains the song slug
        // If it redirected to just the artist page, it's invalid
        if (res.url && !res.url.includes(songSlug)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Fetches song details from a Cifra Club URL.
 * Extracts title, artist from the HTML.
 * Note: Cifra Club now renders chords client-side via JS,
 * so full chord content may not be available via server-side scraping.
 */
export async function fetchCifraClubSong(url: string): Promise<CifraClubSong | null> {
    try {
        const response = await fetch(url, { headers: HEADERS });
        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract basic info (these work reliably)
        const title = $('h1.t1').text().trim() || $('h1').eq(1).text().trim();
        const artist = $('h2.t3').text().trim() || $('h2').first().text().trim();

        // Try to extract tonality from embedded JSON data
        let tonality = '';
        const scriptContent = $('script').map((_i, el) => $(el).html()).get().join('');
        const tomMatch = scriptContent.match(/"tom":\s*"([^"]+)"/);
        if (tomMatch) {
            tonality = tomMatch[1];
        }

        // Try to extract lyrics from meta description
        const metaDesc = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') || '';

        // Try to extract chord content from pre tags (legacy pages)
        let lyricsWithChords = '';
        const preContent = $('.cifra_cnt pre').text() || $('pre').first().text();
        if (preContent && preContent.length > 50) {
            lyricsWithChords = preContent;
        }

        // If no pre content, try to extract from the page's text content
        if (!lyricsWithChords) {
            // Extract from the .cifra section text
            const cifraText = $('.cifra').text().trim();
            if (cifraText && cifraText.length > 100) {
                // Clean up navigation text and extract just the lyrics portion
                const lines = cifraText.split('\n');
                const lyricsLines: string[] = [];
                let inLyrics = false;

                for (const line of lines) {
                    const trimmed = line.trim();
                    // Skip UI elements
                    if (!trimmed) continue;
                    if (trimmed.includes('Cifra Club') && trimmed.length < 30) continue;
                    if (trimmed.includes('Contribua!')) continue;
                    if (trimmed.includes('Auto rolagem')) continue;
                    if (trimmed.includes('Restaurar')) continue;

                    // Start collecting at the song title
                    if (trimmed === title) {
                        inLyrics = true;
                        continue;
                    }
                    if (trimmed === artist) continue;

                    if (inLyrics && trimmed.length > 2) {
                        lyricsLines.push(trimmed);
                    }
                }

                if (lyricsLines.length > 2) {
                    lyricsWithChords = lyricsLines.join('\n');
                }
            }
        }

        // Fallback: use meta description as minimal content
        if (!lyricsWithChords && metaDesc) {
            lyricsWithChords = metaDesc.replace(/\s*\/\s*/g, '\n');
        }

        if (!title) return null;

        return {
            title,
            artist,
            tonality: normalizeTonality(tonality),
            content: lyricsWithChords,
            url
        };
    } catch (error) {
        console.error('Error fetching Cifra Club song:', error);
        return null;
    }
}

function normalizeTonality(raw: string): string {
    const note = raw.replace(/Tom:\s*/i, '').trim();
    return note || 'C';
}
