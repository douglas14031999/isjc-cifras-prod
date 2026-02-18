'use client'

import { useState } from 'react'
import { Ministry } from '@/lib/types'
import {
    Plus,
    MoreHorizontal,
    Trash2,
    Copy,
    Check,
    Users,
    Building2,
    ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createMinistry, deleteMinistry } from './actions'
import { useToast } from '@/hooks/use-toast'

interface ExtendedMinistry extends Ministry {
    members_count?: [{ count: number }] | any
}

interface MinistriesClientProps {
    initialData: ExtendedMinistry[]
}

export default function MinistriesClient({ initialData }: MinistriesClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newName, setNewName] = useState('')
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const { toast } = useToast()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setLoading(true)
        try {
            await createMinistry(newName)
            toast({
                title: "Ministério criado",
                description: `O ministério ${newName} foi criado com sucesso.`,
            })
            setNewName('')
            setIsCreateOpen(false)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível criar o ministério.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este ministério? Todos os músicos e cifras vinculados perderão o acesso.')) return

        try {
            await deleteMinistry(id)
            toast({
                title: "Sucesso",
                description: "Ministério excluído com sucesso.",
            })
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível excluir o ministério.",
                variant: "destructive",
            })
        }
    }

    const copyInviteCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(code)
        toast({
            title: "Código copiado",
            description: "O código de convite foi copiado para sua área de transferência.",
        })
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Ministério
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] border-zinc-200 dark:border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>Criar Ministério</DialogTitle>
                            <DialogDescription>
                                Adicione um novo ministério à plataforma. O código de convite será gerado automaticamente.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Nome do Ministério</label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Ieadpe Vila Rica"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-11"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                    {loading ? "Criando..." : "Criar Ministério"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {initialData.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
                        <Building2 className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Nenhum ministério</h3>
                        <p className="text-muted-foreground mt-1">Comece criando o primeiro ministério do sistema.</p>
                    </div>
                ) : (
                    initialData.map((ministry) => (
                        <Card key={ministry.id} className="group hover:border-blue-500/50 transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">{ministry.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        <span>Ativo</span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem className="text-red-600 focus:text-red-500" onClick={() => handleDelete(ministry.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir Ministério
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 group/code cursor-pointer" onClick={() => copyInviteCode(ministry.invite_code)}>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Código de Convite</p>
                                            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{ministry.invite_code}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                                            {copiedId === ministry.invite_code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover/code:text-foreground transition-colors" />}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>Membros</span>
                                        </div>
                                        <span className="font-bold text-foreground">
                                            {Array.isArray(ministry.members_count) ? ministry.members_count[0]?.count || 0 : 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
