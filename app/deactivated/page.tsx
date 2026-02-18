import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert, LogOut } from 'lucide-react'

export default function DeactivatedPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 text-center">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 lg:p-12 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center border-2 border-red-100 dark:border-red-900/50">
                        <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Conta Suspensa
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        Seu acesso ao sistema foi desativado por um administrador. Entre em contato com o líder do seu ministério para mais informações.
                    </p>
                </div>

                <div className="pt-4 space-y-4">
                    <Button asChild className="w-full h-12 rounded-xl text-base font-semibold" variant="outline">
                        <Link href="/api/auth/signout" className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Sair da Conta
                        </Link>
                    </Button>
                </div>

                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
                    &copy; {new Date().getFullYear()} ISJC Cifras. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
