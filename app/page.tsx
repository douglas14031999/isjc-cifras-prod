import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Layers, Zap, Shield, Smartphone } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo width={32} height={32} />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Button asChild className="hidden sm:inline-flex rounded-full px-6 bg-white text-black hover:bg-zinc-200">
              <Link href="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 Disponível Agora
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-100">
            Gestão de Louvor <br className="hidden md:block" />
            <span className="text-white">Profissional e Simples.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-200 leading-relaxed">
            Organize cifras, escalas e repertórios com uma plataforma moderna, rápida e focada na experiência do músico.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
            <Button asChild size="lg" className="rounded-full px-8 h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50 w-full sm:w-auto">
              <Link href="/register">
                Começar Agora <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm w-full sm:w-auto">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950 border-t border-white/5 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Organização Total</h3>
              <p className="text-zinc-400 leading-relaxed">Mantenha todas as suas cifras e repertórios em um único lugar, acessível de qualquer dispositivo.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transposição Rápida</h3>
              <p className="text-zinc-400 leading-relaxed">Mude o tom das músicas instantaneamente. Ideal para ensaios dinâmicos e ajustes de última hora.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Modo Performance</h3>
              <p className="text-zinc-400 leading-relaxed">Interface limpa e otimizada para tablets e celulares, perfeita para uso no palco.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo width={24} height={24} />
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} ISJC Tecnologia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
