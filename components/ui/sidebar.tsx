'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Music2,
    Settings,
    Users,
    LogOut,
    Menu,
    X,
    FolderOpen,
    PlusCircle,
    Star,
    Crown,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const [isAdmin, setIsAdmin] = React.useState(false)

    React.useEffect(() => {
        const checkAdmin = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()
                setIsAdmin(!!profile?.is_admin)
            }
        }
        checkAdmin()
    }, [])

    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            active: pathname === '/dashboard',
        },
        {
            label: 'Cifras',
            icon: Music2,
            href: '/chords',
            active: pathname.startsWith('/chords'),
        },
        {
            label: 'Favoritos',
            icon: Star,
            href: '/favorites',
            active: pathname.startsWith('/favorites'),
        },
        {
            label: 'Repertórios',
            icon: FolderOpen,
            href: '/repertoires',
            active: pathname.startsWith('/repertoires'),
        },
        {
            label: 'Escalas',
            icon: Calendar,
            href: '/schedules',
            active: pathname.startsWith('/schedules'),
        },
        {
            label: 'Músicos',
            icon: Users,
            href: '/musicians',
            active: pathname.startsWith('/musicians'),
        },
        {
            label: 'Configurações',
            icon: Settings,
            href: '/settings',
            active: pathname.startsWith('/settings'),
        },
    ]

    const adminRoutes = [
        {
            label: 'Ministérios',
            icon: Crown,
            href: '/admin/ministries',
            active: pathname.startsWith('/admin/ministries'),
        }
    ]

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden fixed top-4 left-4 z-50"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X /> : <Menu />}
            </Button>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block border-r border-zinc-800 print:hidden",
                isMobileOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
                            <Logo width={28} height={28} />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        <div className="mb-6 px-2">
                            <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                <Link href="/chords/new">
                                    <PlusCircle className="w-4 h-4" />
                                    Nova Cifra
                                </Link>
                            </Button>
                        </div>

                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>

                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    route.active
                                        ? "bg-blue-600/10 text-blue-400"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <route.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    route.active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                                )} />
                                {route.label}
                            </Link>
                        ))}

                        {isAdmin && (
                            <>
                                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2 mt-6">Administração</div>
                                {adminRoutes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                            route.active
                                                ? "bg-amber-600/10 text-amber-400"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <route.icon className={cn(
                                            "w-5 h-5 transition-colors",
                                            route.active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
                                        )} />
                                        {route.label}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-5 h-5" />
                            Sair da conta
                        </Button>
                    </div>
                </div>
            </div>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
