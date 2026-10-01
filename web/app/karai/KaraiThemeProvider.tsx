// Karai usa la línea gráfica de Agroconecta (tema claro único, ver .karai-root en globals.css). Este
// contenedor solo aplica la clase raíz; ya no hay modo oscuro propio ni preferencia guardada.
export function KaraiThemeProvider({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>
}
