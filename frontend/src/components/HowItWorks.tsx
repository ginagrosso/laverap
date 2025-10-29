import { Package, Radio, Banknote, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const steps = [
  {
    icon: Package,
    title: "Dejá tu ropa",
    description: "Traé tus prendas al local y mostrá tu código QR",
  },
  {
    icon: Radio,
    title: "Seguimiento en tiempo real",
    description: "Mirá el estado de tu pedido desde cualquier lugar",
  },
  {
    icon: Banknote,
    title: "Pagás en el local",
    description: "Efectivo o transferencia al momento del retiro",
  },
  {
    icon: CheckCircle,
    title: "Retirá sin demoras",
    description: "Tu ropa lista cuando la necesités",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">¿Cómo funciona?</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Simple, rápido y transparente
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                <CardContent className="pt-6 text-center">
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
