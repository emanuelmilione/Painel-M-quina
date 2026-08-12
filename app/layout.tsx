export const metadata = {
  title: 'KAPA - Painel de Vendas',
  description: 'Painel de vendas do higienizador de capacetes KAPA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, backgroundColor: '#0B0D12', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
