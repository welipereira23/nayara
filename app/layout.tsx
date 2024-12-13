import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Controle de Gastos',
  description: 'Aplicativo para controle de gastos pessoais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
