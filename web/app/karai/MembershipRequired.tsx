import { Logo } from '@/components/Logo'
import { WHATSAPP_URL } from '@/lib/social-links'
import { SignOutInline } from './SignOutInline'

export function MembershipRequired({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo width={140} height={40} className="h-9 w-auto" />
        </div>
        <h1 className="font-display font-semibold text-xl text-foreground">Karai es para miembros</h1>
        <p className="text-muted text-sm mt-2">
          Tu cuenta ({email}) todavía no tiene una membresía activa de Agroconecta. Activala desde la
          app o escribinos por WhatsApp para más información.
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-6">
          Consultar por WhatsApp
        </a>
        <div className="mt-4">
          <SignOutInline />
        </div>
      </div>
    </div>
  )
}
