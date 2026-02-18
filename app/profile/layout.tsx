'use client'

import { Sidebar } from "@/components/ui/sidebar"

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-screen p-4 lg:p-8 pt-16 lg:pt-8 w-full">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
