'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createMinistry } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, ArrowRight } from 'lucide-react'

const initialState = {
    message: '',
    errors: undefined,
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-[2px] transition-all active:scale-[0.98]"
        >
            {pending ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    INICIALIZANDO...
                </span>
            ) : (
                <span className="flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                    Criar Ministério <ArrowRight className="w-4 h-4 ml-1" />
                </span>
            )}
        </Button>
    )
}

export default function CreateMinistryForm() {
    const [state, formAction] = useFormState(createMinistry, initialState)

    return (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3 p-4 border-l-4 border-primary bg-primary/5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">Provisionamento de Ministério</h3>
                </div>
                <p className="text-muted-foreground text-[10px] uppercase font-mono leading-relaxed max-w-sm">
                    Acesso exclusivo ao Perfil Administrador. Defina o identificador global e o token de convite único.
                </p>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="space-y-2 group">
                    <Label htmlFor="name" className="text-[10px] uppercase font-mono text-muted-foreground group-focus-within:text-primary transition-colors ml-1">Ministry_Name_ID</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="EX: MINISTÉRIO DE LOUVOR ISJC"
                        className="h-11 bg-surface/20 border-border/50 focus:border-primary rounded-[2px] font-bold placeholder:font-normal"
                        required
                    />
                    {state?.errors?.name && (
                        <p className="text-destructive font-mono text-[10px] uppercase mt-1">{state.errors.name}</p>
                    )}
                </div>

                <div className="space-y-2 group">
                    <Label htmlFor="invite_code" className="text-[10px] uppercase font-mono text-muted-foreground group-focus-within:text-primary transition-colors ml-1">Invite_Token_Encryption</Label>
                    <div className="relative">
                        <Input
                            id="invite_code"
                            name="invite_code"
                            type="text"
                            placeholder="TOKEN_ÚNICO"
                            className="h-11 bg-surface/20 border-border/50 focus:border-primary rounded-[2px] font-mono text-center tracking-[0.3em] uppercase"
                            required
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase ml-1">
                        Sugerido: SIGLA + ANO (EX: ISJC2026)
                    </p>
                    {state?.errors?.invite_code && (
                        <p className="text-destructive font-mono text-[10px] uppercase mt-1">{state.errors.invite_code}</p>
                    )}
                </div>

                {state?.message && (
                    <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 font-mono text-[10px] uppercase flex items-center gap-3">
                        <div className="w-1 h-4 bg-destructive" />
                        SYSTEM_FAIL: {state.message}
                    </div>
                )}

                <SubmitButton />
            </form>
        </div>
    )
}
