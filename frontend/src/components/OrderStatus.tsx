import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statuses = ["Pendiente", "En Proceso", "Finalizado", "Entregado"] as const;
type Status = typeof statuses[number];

export const OrderStatus = () => {
  const [currentStatus, setCurrentStatus] = useState<Status>("Pendiente");

  const handleUpdateStatus = () => {
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    setCurrentStatus(nextStatus);
    toast.success(`Estado actualizado: ${nextStatus}`);
  };

  const getStatusIndex = (status: Status) => statuses.indexOf(status);
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-4">Seguimiento de pedido</h2>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Conocé el estado en tiempo real
        </p>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              Pedido: <span className="text-primary">LVR-1234</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Timeline */}
            <div 
              className="space-y-4" 
              role="region" 
              aria-label="Estado del pedido"
              aria-live="polite"
            >
              {statuses.map((status, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={status} className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 
                          className={`w-8 h-8 ${isCurrent ? "text-primary animate-pulse" : "text-accent"}`}
                        />
                      ) : (
                        <Circle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Status Label */}
                    <div className="flex-grow">
                      <p 
                        className={`text-lg font-semibold ${
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {status}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-primary flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Estado actual
                        </p>
                      )}
                    </div>

                    {/* Connection Line */}
                    {index < statuses.length - 1 && (
                      <div 
                        className={`absolute left-[15px] w-0.5 h-12 mt-12 ${
                          isCompleted ? "bg-accent" : "bg-muted"
                        }`}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <Button 
              onClick={handleUpdateStatus} 
              className="w-full"
              variant="outline"
            >
              Actualizar estado (demo)
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              <p>Tiempo estimado de entrega: 24 horas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
