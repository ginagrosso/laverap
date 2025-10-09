import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Banknote, Building2, Receipt } from "lucide-react";
import { toast } from "sonner";

export const PaymentDemo = () => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo");

  const handlePayment = () => {
    setShowReceipt(true);
    toast.success(`Pago registrado: ${paymentMethod}`);
  };

  const operationNumber = `OP-${Math.floor(Math.random() * 100000)}`;
  const amount = 4200;
  const timestamp = new Date().toLocaleString("es-AR");

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-4">Pagos en el local</h2>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Simple y seguro
        </p>

        {!showReceipt ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Métodos de pago disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`p-6 border-2 rounded-lg transition-all hover:shadow-md ${
                    paymentMethod === "efectivo"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Banknote className="w-12 h-12 text-primary" />
                    <p className="font-semibold text-lg">Efectivo</p>
                    <Badge variant="secondary">💵 Aceptamos billetes</Badge>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("transferencia")}
                  className={`p-6 border-2 rounded-lg transition-all hover:shadow-md ${
                    paymentMethod === "transferencia"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="w-12 h-12 text-primary" />
                    <p className="font-semibold text-lg">Transferencia</p>
                    <Badge variant="secondary">🏦 CBU disponible</Badge>
                  </div>
                </button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  El pago se realiza al momento de retirar tu ropa del local.
                  No necesitás pagar por adelantado.
                </p>
              </div>

              <Button onClick={handlePayment} className="w-full text-lg py-6">
                Registrar pago (demo)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-2 border-accent animate-slide-up">
            <CardHeader className="bg-accent text-accent-foreground">
              <div className="flex items-center justify-center gap-3">
                <Receipt className="w-8 h-8" />
                <CardTitle className="text-2xl">Comprobante de Pago</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Nº de operación:</span>
                  <span className="font-bold">{operationNumber}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-semibold capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-bold text-accent text-xl">${amount}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Fecha y hora:</span>
                  <span className="font-semibold">{timestamp}</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground py-4">
                <p>✓ Pago confirmado</p>
                <p>Guardá este comprobante para cualquier consulta</p>
              </div>

              <Button 
                onClick={() => setShowReceipt(false)} 
                variant="outline" 
                className="w-full"
              >
                Registrar otro pago
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
