'use client'

import { useState } from 'react'
import { Copy, Check, Plus, User, Search, Mail, Shield, Music, Calendar, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Profile {
    id: string
    name: string | null
    email: string | null
    ministry_id: string | null
    is_admin: boolean
    is_active: boolean
    avatar_url?: string | null
    created_at: string
    chords_count?: { count: number }[]
    ministries?: { name: string } | null
}

interface MusiciansClientProps {
    musicians: Profile[]
    ministry: any
    userProfile: any
}

export default function MusiciansClient({ musicians, ministry, userProfile }: MusiciansClientProps) {
    const [query, setQuery] = useState('')
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const selectedMusician = selectedId ? musicians.find(m => m.id === selectedId) : null

    const copyInviteCode = () => {
        if (!ministry?.invite_code) return
        navigator.clipboard.writeText(ministry.invite_code)
        setCopied(true)
        toast({
            title: "Copiado!",
            description: "Código de convite copiado para a área de transferência.",
        })
        setTimeout(() => setCopied(false), 2000)
    }

    const handleToggleActive = async (musician: Profile) => {
        // Prevent self-deactivation
        if (musician.id === userProfile.id) {
            toast({
                title: "Ação não permitida",
                description: "Você não pode desativar seu próprio perfil.",
                variant: "destructive"
            })
            return
        }

        const newStatus = !musician.is_active

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: newStatus })
                .eq('id', musician.id)

            if (error) throw error

            toast({
                title: newStatus ? "Usuário Reativado" : "Usuário Desativado",
                description: `${musician.name} foi ${newStatus ? 'reativado' : 'desativado'} com sucesso.`
            })

            router.refresh()
        } catch (error: any) {
            toast({
                title: "Erro",
                description: "Não foi possível alterar o status do usuário.",
                variant: "destructive"
            })
        }
    }

    const filteredMusicians = musicians.filter(musician =>
        musician.name?.toLowerCase().includes(query.toLowerCase()) ||
        musician.email?.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Músicos</h1>
                    <p className="text-muted-foreground mt-1 text-balanced max-w-lg">
                        {userProfile?.is_admin
                            ? 'Visualizando todos os membros da plataforma.'
                            : `Gerencie os membros da equipe de louvor do ${ministry?.name || 'seu ministério'}.`}
                    </p>
                </div>

                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Convidar Músico
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Convidar Membro</DialogTitle>
                            <DialogDescription>
                                Compartilhe este código com os novos músicos do seu ministério.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 py-4">
                            <div className="grid flex-1 gap-2">
                                <Input
                                    id="link"
                                    defaultValue={ministry?.invite_code || '---'}
                                    readOnly
                                    className="font-mono text-center text-lg tracking-widest bg-zinc-50 dark:bg-zinc-900 border-2"
                                />
                            </div>
                            <Button size="icon" onClick={copyInviteCode} className="px-3">
                                <span className="sr-only">Copiar</span>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Ao se cadastrarem, os novos membros devem inserir este código para entrar automaticamente na sua equipe.
                        </p>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome..."
                        className="pl-9 bg-white dark:bg-zinc-900"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            {userProfile?.is_admin && <TableHead>Ministério</TableHead>}
                            <TableHead>Função</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMusicians.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={userProfile?.is_admin ? 5 : 4} className="h-24 text-center text-muted-foreground">
                                    Nenhum músico encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMusicians.map((musician) => (
                                <TableRow key={musician.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-white dark:border-zinc-800 shadow-sm">
                                                <AvatarImage src={musician.avatar_url || ''} />
                                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {musician.name?.charAt(0).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{musician.name || 'Sem nome'}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{musician.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {userProfile?.is_admin && (
                                        <TableCell className="max-w-[150px] truncate font-medium text-zinc-600">
                                            {musician.ministries?.name || '---'}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {musician.is_admin ? (
                                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Admin</Badge>
                                        ) : (
                                            <Badge variant="outline">Membro</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={musician.is_active
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                            }
                                        >
                                            {musician.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {userProfile?.is_admin && musician.id !== userProfile.id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={musician.is_active
                                                        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    }
                                                    onClick={() => handleToggleActive(musician)}
                                                >
                                                    {musician.is_active ? 'Desativar' : 'Reativar'}
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedId(musician.id)}>
                                                Detalhes
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Musician Details Dialog */}
            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-left">
                        <DialogTitle>Detalhes do Músico</DialogTitle>
                        <DialogDescription>
                            Informações e atividades do membro no ministério.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMusician && (
                        <div className="mt-4 space-y-6">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-800 shadow-lg">
                                    <AvatarImage src={selectedMusician.avatar_url || ''} />
                                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-3xl font-bold">
                                        {selectedMusician.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedMusician.name || 'Sem nome'}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        {selectedMusician.is_admin ? (
                                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Administrador</Badge>
                                        ) : (
                                            <Badge variant="outline">Membro da Equipe</Badge>
                                        )}
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Ativo</Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contato</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-zinc-400" />
                                        <span>{selectedMusician.email || 'Email não disponível'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                        <span>Membro desde {new Date(selectedMusician.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Activity Stats */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atividade</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-zinc-50 dark:bg-zinc-900 border-none shadow-none">
                                        <CardContent className="p-4 flex flex-col items-center justify-center">
                                            <Music className="w-5 h-5 text-blue-500 mb-1" />
                                            <span className="text-2xl font-bold">{selectedMusician.chords_count?.[0]?.count || 0}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Cifras Criadas</span>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-zinc-50 dark:bg-zinc-900 border-none shadow-none">
                                        <CardContent className="p-4 flex flex-col items-center justify-center">
                                            <Shield className="w-5 h-5 text-purple-500 mb-1" />
                                            <span className="text-2xl font-bold">---</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Participações</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full" variant="outline" onClick={() => setSelectedId(null)}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
