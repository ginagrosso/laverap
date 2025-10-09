import { EstimatorForm } from "@/components/EstimatorForm";
import { Footer } from "@/components/Footer";

export default function CreateOrder() {
  // TODO: Convert EstimatorForm to use actual backend API
  // For now, reusing the existing component as a placeholder

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Crear Pedido</h1>
          <p className="text-lg opacity-90">
            Configurá tu servicio y obtené un presupuesto al instante
          </p>
        </div>
      </section>

      {/* Form Section */}
      <EstimatorForm />

      <Footer />
    </div>
  );
}
