'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    User,
    Palette,
    Bell,
    Lock,
    Trash2,
    ExternalLink,
    ChevronRight,
    Smartphone,
    Monitor,
    Shield,
    Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTIONS = [
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'notifications', label: 'Notificações', icon: Bell },
]

export default function SettingsClient() {
    const [activeSection, setActiveSection] = useState('account')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [fontSize, setFontSize] = useState('16')
    const [isGlassEnabled, setIsGlassEnabled] = useState(true)
    const router = useRouter()

    // Initialize settings from DOM/localStorage
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setIsDarkMode(isDark)

        const savedFontSize = localStorage.getItem('isjc-font-size') || '16'
        setFontSize(savedFontSize)

        const glassPref = localStorage.getItem('isjc-glass-effect') !== 'false'
        setIsGlassEnabled(glassPref)
    }, [])

    const toggleTheme = (checked: boolean) => {
        setIsDarkMode(checked)
        if (checked) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
        toast.success(`Tema ${checked ? 'escuro' : 'claro'} ativado`)
    }

    const handleFontSizeChange = (value: string) => {
        setFontSize(value)
        localStorage.setItem('isjc-font-size', value)
        toast.success(`Tamanho da fonte ajustado para ${value}px`)
    }

    const toggleGlass = (checked: boolean) => {
        setIsGlassEnabled(checked)
        localStorage.setItem('isjc-glass-effect', String(checked))
        toast.info(`Efeito Glassmorphism ${checked ? 'ativado' : 'desativado'}`)
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const renderAccount = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Perfil</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20 ring-4 ring-white dark:ring-zinc-900 overflow-hidden relative">
                                D
                            </div>
                            <button className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Monitor className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h2 className="text-2xl font-black tracking-tight">Usuário</h2>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <span>Acesse suas informações</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                <span className="font-bold text-blue-600">Ativo</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl border-zinc-200 h-11 px-6 font-bold uppercase tracking-wider text-[11px]"
                            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        >
                            Editar Perfil
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status da Conta</span>
                            <p className="font-bold text-sm">Validada</p>
                        </div>
                        <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Membro desde</span>
                            <p className="font-bold text-sm">2024</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Segurança</h3>
                </div>
                <div className="p-8 space-y-6">
                    <button
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Alterar Senha</p>
                                <p className="text-xs text-zinc-500">Mude sua senha de acesso ao portal</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Autenticação em Duas Etapas</p>
                                <p className="text-xs text-zinc-500">Adicione uma camada extra de proteção</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-red-600">Sair com segurança</p>
                            <p className="text-xs text-zinc-500">Encerrar sua sessão atual</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleSignOut}
                            className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-black text-[10px] uppercase tracking-wider px-4"
                        >
                            Encerrar Sessão
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )

    const renderAppearance = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Interface</h3>
                </div>
                <div className="p-8 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Tema Escuro</p>
                            <p className="text-xs text-zinc-500">Reduz o cansaço visual em ambientes escuros</p>
                        </div>
                        <Switch
                            checked={isDarkMode}
                            onCheckedChange={toggleTheme}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Tamanho da Fonte (Cifras)</p>
                            <p className="text-xs text-zinc-500">Tamanho padrão ao abrir novas cifras</p>
                        </div>
                        <Select value={fontSize} onValueChange={handleFontSizeChange}>
                            <SelectTrigger className="w-full md:w-[240px] h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 font-bold text-sm">
                                <SelectValue placeholder="Escolha um tamanho" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                <SelectItem value="12">Pequeno (12px)</SelectItem>
                                <SelectItem value="14">Normal (14px)</SelectItem>
                                <SelectItem value="16">Médio (16px)</SelectItem>
                                <SelectItem value="18">Grande (18px)</SelectItem>
                                <SelectItem value="20">Extra Grande (20px)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Transparência (Glassmorphism)</p>
                            <p className="text-xs text-zinc-500">Efeitos de desfoque no cabeçalho e menus</p>
                        </div>
                        <Switch
                            checked={isGlassEnabled}
                            onCheckedChange={toggleGlass}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900 transition-colors shadow-sm cursor-pointer border-blue-500/50">
                    <div className="relative z-10 space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2">
                            <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Desktop</h4>
                        <p className="font-bold text-sm">Layout Moderno</p>
                        <p className="text-xs text-zinc-500">Visual otimizado para telas grandes</p>
                    </div>
                </Card>

                <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm cursor-pointer opacity-50 grayscale">
                    <div className="relative z-10 space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-2">
                            <Smartphone className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Mobile</h4>
                        <p className="font-bold text-sm">PWA (Em breve)</p>
                        <p className="text-xs text-zinc-500">Aplicativo instalável</p>
                    </div>
                </Card>
            </div>
        </div>
    )

    const renderNotifications = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Alertas do App</h3>
                </div>
                <div className="p-8 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Novas Cifras</p>
                            <p className="text-xs text-zinc-500">Avisar quando novas músicas forem adicionadas</p>
                        </div>
                        <Switch defaultChecked onCheckedChange={(c) => toast.success(`Notificações de cifras ${c ? 'ativadas' : 'desativadas'}`)} className="data-[state=checked]:bg-blue-600" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Escalas e Ministérios</p>
                            <p className="text-xs text-zinc-500">Notificar quando você for escalado</p>
                        </div>
                        <Switch defaultChecked onCheckedChange={(c) => toast.success(`Alertas de escala ${c ? 'ativados' : 'desativados'}`)} className="data-[state=checked]:bg-blue-600" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-sm">Comentários e Sugestões</p>
                            <p className="text-xs text-zinc-500">Alertas sobre edições sugeridas nas suas cifras</p>
                        </div>
                        <Switch onCheckedChange={(c) => toast.success(`Feedbacks ${c ? 'ativados' : 'desativados'}`)} className="data-[state=checked]:bg-blue-600" />
                    </div>
                </div>
            </Card>

            <Card className="rounded-2xl border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-sm">Notificações Push</h4>
                    <p className="text-xs text-zinc-500 max-w-[280px] mx-auto">
                        Para receber alertas em tempo real no seu celular, você precisa ativar as permissões do navegador.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), {
                        loading: 'Solicitando permissão...',
                        success: 'Permissão concedida (Simulado)',
                        error: 'Erro ao configurar'
                    })}
                    className="rounded-xl border-zinc-200 h-10 px-6 font-black text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                    Configurar Navegador
                </Button>
            </Card>
        </div>
    )

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-zinc-50">Configurações</h1>
                    <p className="text-sm text-zinc-500 font-medium">Personalize sua experiência no ISJC Cifras.</p>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
                <nav className="w-full lg:w-64 flex flex-row lg:flex-col gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                activeSection === section.id
                                    ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-700"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <section.icon className={cn(
                                "w-4 h-4",
                                activeSection === section.id ? "text-blue-600" : "text-zinc-400"
                            )} />
                            <span className="hidden lg:inline">{section.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex-1 w-full max-w-3xl">
                    {activeSection === 'account' && renderAccount()}
                    {activeSection === 'appearance' && renderAppearance()}
                    {activeSection === 'notifications' && renderNotifications()}
                </div>
            </div>
        </div>
    )
}
