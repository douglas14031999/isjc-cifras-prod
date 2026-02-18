import { createClient } from '@/lib/supabase/server'
import SettingsClient from './settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    return <SettingsClient />
}
