import { NavLink } from "react-router-dom";
import { House, History, Users, Package, Settings } from "lucide-react";

const enlaces = [
  { ruta: "/dashboard", texto: "Inicio", icono: House, exacto: true },
  { ruta: "/cotizaciones", texto: "Historial", icono: History },
  { ruta: "/clientes", texto: "Clientes", icono: Users },
  { ruta: "/catalogo", texto: "Catálogo", icono: Package },
  { ruta: "/configurar-negocio", texto: "Ajustes", icono: Settings },
];

export default function NavegacionMovil() {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-[0_-3px_18px_rgba(15,23,42,0.06)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {enlaces.map(({ ruta, texto, icono: Icono, exacto }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end={exacto}
            className={({ isActive }) => `flex min-h-[68px] flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium ${isActive ? "text-orange-500" : "text-slate-500"}`}
          >
            <Icono aria-hidden="true" className="h-5 w-5" />
            <span>{texto}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
