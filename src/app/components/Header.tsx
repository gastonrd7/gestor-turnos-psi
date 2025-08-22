"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const pathname = usePathname();

  const linkCls = (href: string) =>
    `hover:text-indigo-700 ${pathname === href ? "text-indigo-700 font-semibold" : ""}`;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-indigo-600" />
            <h1 className="text-lg font-semibold">Gestión de sesiones</h1>
          </div>
          {/* Desktop */}
          <nav className="hidden gap-6 text-sm text-gray-700 md:flex">
            <Link className={linkCls("/agenda")} href="/agenda">Agenda</Link>
            <Link className={linkCls("/turnos")} href="/turnos">Turnos</Link>
          </nav>
          {/* Mobile */}
          <button
            className="md:hidden h-9 w-9 rounded-lg border border-gray-200 grid place-items-center"
            onClick={() => setOpenMenu(v => !v)}
            aria-label="Abrir menú"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-gray-700"></span>
              <span className="block h-0.5 w-5 bg-gray-700"></span>
              <span className="block h-0.5 w-5 bg-gray-700"></span>
            </div>
          </button>
        </div>

        {openMenu && (
          <div className="md:hidden mt-3 rounded-xl border border-gray-200 bg-white p-3 text-sm">
            <Link onClick={() => setOpenMenu(false)} className="block px-2 py-2 hover:text-indigo-700" href="/agenda">Agenda</Link>
            <Link onClick={() => setOpenMenu(false)} className="block px-2 py-2 hover:text-indigo-700" href="/turnos">Turnos</Link>
          </div>
        )}
      </div>
    </header>
  );
}