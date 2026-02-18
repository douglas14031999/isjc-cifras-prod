/**
 * Lógica de transposição de acordes musicais
 * Suporta transposição cromática (semitons) mantendo a formatação original
 */

// Notas musicais em ordem cromática
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Mapeamento de equivalências (sustenido/bemol)
const ENHARMONIC_MAP: Record<string, string> = {
    'C#': 'Db',
    'Db': 'C#',
    'D#': 'Eb',
    'Eb': 'D#',
    'F#': 'Gb',
    'Gb': 'F#',
    'G#': 'Ab',
    'Ab': 'G#',
    'A#': 'Bb',
    'Bb': 'A#',
}

/**
 * Transpõe um acorde individual
 * @param chord - Acorde a ser transposto (ex: "Am7", "C#m", "Bb7M")
 * @param semitones - Número de semitons para transpor (positivo = subir, negativo = descer)
 * @returns Acorde transposto
 */
export function transposeChord(chord: string, semitones: number): string {
    // Regex para capturar a nota base e o resto do acorde
    const chordRegex = /^([A-G][#b]?)(.*)$/
    const match = chord.match(chordRegex)

    if (!match) return chord

    const [, baseNote, suffix] = match

    // Determinar qual array de notas usar (com sustenidos ou bemóis)
    const useFlats = baseNote.includes('b')
    const notesArray = useFlats ? NOTES_FLAT : NOTES

    // Encontrar índice da nota base
    let noteIndex = notesArray.indexOf(baseNote)

    // Se não encontrou, tentar equivalente enarmônico
    if (noteIndex === -1) {
        const enharmonic = ENHARMONIC_MAP[baseNote]
        if (enharmonic) {
            noteIndex = notesArray.indexOf(enharmonic)
        }
    }

    if (noteIndex === -1) return chord

    // Calcular novo índice (módulo 12 para circular)
    const newIndex = (noteIndex + semitones + 12) % 12

    // Retornar nota transposta + sufixo original
    return notesArray[newIndex] + suffix
}

/**
 * Calcula a diferença em semitones entre duas tonalidades
 * @param from - Tonalidade de origem
 * @param to - Tonalidade de destino
 * @returns Número de semitones
 */
export function getSemitonesBetween(from: string, to: string): number {
    const fromNote = from.match(/^([A-G][#b]?)/)?.[0]
    const toNote = to.match(/^([A-G][#b]?)/)?.[0]

    if (!fromNote || !toNote) return 0

    const fromIdx = NOTES.indexOf(fromNote) !== -1 ? NOTES.indexOf(fromNote) : NOTES_FLAT.indexOf(fromNote)
    const toIdx = NOTES.indexOf(toNote) !== -1 ? NOTES.indexOf(toNote) : NOTES_FLAT.indexOf(toNote)

    if (fromIdx === -1 || toIdx === -1) return 0

    let diff = toIdx - fromIdx
    // Se a diferença for muito grande, ajustar para o caminho mais curto
    if (diff > 6) diff -= 12
    if (diff < -6) diff += 12

    return diff
}

/**
 * Transpõe todos os acordes em um texto de cifra
 * @param lyrics - Texto completo da cifra (letra + acordes)
 * @param semitones - Número de semitons para transpor
 * @returns Texto com todos os acordes transpostos
 */
export function transposeLyrics(lyrics: string, semitones: number): string {
    // Regex para detectar acordes (nota + possíveis modificadores)
    // Suporta: C, Cm, C7, C7M, Cmaj7, Csus4, Cdim, Caug, C/E, etc.
    const chordRegex = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)(?![A-Za-z])/g

    return lyrics.replace(chordRegex, (match) => {
        return transposeChord(match, semitones)
    })
}

/**
 * Detecta o tom de uma cifra baseado nos acordes mais frequentes
 * @param lyrics - Texto da cifra
 * @returns Tom detectado ou null
 */
export function detectKey(lyrics: string): string | null {
    const chordRegex = /(?<![A-Za-z])([A-G][#b]?)(?![a-z])/g
    const matches = lyrics.match(chordRegex)

    if (!matches || matches.length === 0) return null

    // Contar frequência de cada nota
    const frequency: Record<string, number> = {}
    matches.forEach((note) => {
        frequency[note] = (frequency[note] || 0) + 1
    })

    // Retornar a nota mais frequente
    const mostFrequent = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]
    return mostFrequent ? mostFrequent[0] : null
}

/**
 * Formata um texto de cifra para exibição
 * Adiciona espaçamento e destaque aos acordes
 * @param lyrics - Texto da cifra
 * @returns HTML formatado
 */
export function formatChordSheet(lyrics: string): string {
    const lines = lyrics.split('\n')
    let formatted = ''

    lines.forEach((line) => {
        // Detectar se a linha contém acordes (maioria de letras maiúsculas e símbolos musicais)
        const chordRegex = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)(?![A-Za-z])/g
        const hasChords = chordRegex.test(line)

        if (hasChords) {
            // Linha de acordes - adicionar classe especial
            const highlightedLine = line.replace(
                chordRegex,
                '<span class="chord">$1</span>'
            )
            formatted += `<div class="chord-line">${highlightedLine}</div>\n`
        } else {
            // Linha de letra
            formatted += `<div class="lyric-line">${line}</div>\n`
        }
    })

    return formatted
}
/**
 * Converte um acorde individual para seu respectivo grau harmônico
 * @param chord - Acorde a ser convertido (ex: "Am7", "C#m", "Bb7M")
 * @param rootKey - Tonalidade principal (ex: "C", "G#m")
 * @returns Grau harmônico (ex: "VIm7", "#IVm", "bVII7M")
 */
export function chordToDegree(chord: string, rootKey: string): string {
    const chordRegex = /^([A-G][#b]?)(.*)$/
    const match = chord.match(chordRegex)
    if (!match) return chord

    const [, baseNote, suffix] = match

    // Extrair nota base da tonalidade (ignorar se é menor no rootKey)
    const rootNote = rootKey.match(/^([A-G][#b]?)/)?.[0]
    if (!rootNote) return chord

    const fromIdx = NOTES.indexOf(rootNote) !== -1 ? NOTES.indexOf(rootNote) : NOTES_FLAT.indexOf(rootNote)
    const toIdx = NOTES.indexOf(baseNote) !== -1 ? NOTES.indexOf(baseNote) : NOTES_FLAT.indexOf(baseNote)

    if (fromIdx === -1 || toIdx === -1) return chord

    const diff = (toIdx - fromIdx + 12) % 12

    const degrees = [
        'I',   // 0
        'bII', // 1
        'II',  // 2
        'bIII',// 3
        'III', // 4
        'IV',  // 5
        '#IV', // 6
        'V',   // 7
        'bVI', // 8
        'VI',  // 9
        'bVII',// 10
        'VII'  // 11
    ]

    return degrees[diff] + suffix
}

/**
 * Converte todos os acordes em um texto de cifra para graus harmônicos
 * @param lyrics - Texto da cifra
 * @param rootKey - Tonalidade principal
 * @returns Texto com graus harmônicos
 */
export function convertLyricsToDegrees(lyrics: string, rootKey: string): string {
    const chordRegex = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|M|dim|aug|sus|add)?[0-9]?[0-9]?(?:\/[A-G][#b]?)?)(?![A-Za-z])/g

    return lyrics.replace(chordRegex, (match) => {
        // Se for um acorde composto (Slash Chord ex: C/E)
        if (match.includes('/')) {
            const [main, bass] = match.split('/')
            return `${chordToDegree(main, rootKey)}/${chordToDegree(bass, rootKey)}`
        }
        return chordToDegree(match, rootKey)
    })
}
