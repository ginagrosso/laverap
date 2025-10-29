import { OperationalPanel } from "@/components/OperationalPanel";

export default function Orders() {
  // TODO: Convert OperationalPanel to use actual backend API with update capabilities
  // For now, reusing the existing component

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-lg opacity-90">Panel operativo para actualizar estados</p>
        </div>
      </section>

      {/* Operational Panel */}
      <OperationalPanel />
    </div>
  );
}
