// src/app/agenda/page.tsx
"use client";
import dynamic from "next/dynamic";

const AgendaSection = dynamic(() => import("../components/CalendarSection"), { ssr: false });
const SelectedPanel = dynamic(() => import("../components/SelectedPanel"), { ssr: false });

export default function AgendaPage() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <AgendaSection />
      </div>
      <aside className="lg:col-span-4">
        <SelectedPanel />
      </aside>
    </section>
  );
}
