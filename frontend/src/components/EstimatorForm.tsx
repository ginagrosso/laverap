import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { QrCode, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Services {
  lavado: boolean;
  secado: boolean;
  planchado: boolean;
  delicado: boolean;
}

const PRICES = {
  lavado: 800,
  secado: 600,
  planchado: 400,
  delicado: 300,
  perKg: 200,
  perPrenda: 150,
};

export const EstimatorForm = () => {
  const [services, setServices] = useState<Services>({
    lavado: false,
    secado: false,
    planchado: false,
    delicado: false,
  });
  const [kg, setKg] = useState<number>(0);
  const [prendas, setPrendas] = useState<number>(0);
  const [turno, setTurno] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderId] = useState(() => `LVR-${Math.floor(Math.random() * 10000)}`);

  const calculatePrice = () => {
    let total = 0;
    
    if (services.lavado) total += PRICES.lavado;
    if (services.secado) total += PRICES.secado;
    if (services.planchado) total += PRICES.planchado;
    if (services.delicado) total += PRICES.delicado;
    
    total += kg * PRICES.perKg;
    total += prendas * PRICES.perPrenda;
    
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turno) {
      toast.error("Por favor seleccioná un turno");
      return;
    }
    setShowReceipt(true);
    toast.success("¡Pedido creado exitosamente!");
  };

  const estimatedPrice = calculatePrice();
  const hasServices = Object.values(services).some(v => v);

  if (showReceipt) {
    return (
      <section id="estimator" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="shadow-lg border-2 border-primary animate-slide-up">
            <CardHeader className="bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <Receipt className="w-8 h-8" />
                <CardTitle className="text-2xl">Comprobante Digital</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Número de Pedido</p>
                <p className="text-3xl font-bold text-primary">{orderId}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios:</span>
                  <span className="font-semibold">
                    {Object.entries(services)
                      .filter(([_, v]) => v)
                      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                      .join(", ") || "Ninguno"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad:</span>
                  <span className="font-semibold">{kg}kg, {prendas} prendas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turno:</span>
                  <span className="font-semibold">{turno}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span className="font-bold">Total estimado:</span>
                  <span className="font-bold text-primary">${estimatedPrice}</span>
                </div>
              </div>

              <div className="flex justify-center p-6 bg-white rounded-lg">
                <div className="flex flex-col items-center">
                  <QrCode className="w-32 h-32 text-primary" />
                  <p className="text-xs text-muted-foreground mt-2">Código QR Demo</p>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Presentá este código al dejar tu ropa en el local
              </p>

              <Button 
                onClick={() => setShowReceipt(false)} 
                variant="outline" 
                className="w-full"
              >
                Crear otro pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="estimator" className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Estimá tu pedido</CardTitle>
            <CardDescription className="text-center text-lg">
              Configurá los servicios y obtené un presupuesto al instante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Services */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Servicios</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(services) as Array<keyof Services>).map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={services[service]}
                        onCheckedChange={(checked) =>
                          setServices({ ...services, [service]: checked === true })
                        }
                      />
                      <Label 
                        htmlFor={service} 
                        className="text-base cursor-pointer capitalize"
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kg">Kilogramos (kg)</Label>
                  <Input
                    id="kg"
                    type="number"
                    min="0"
                    value={kg || ""}
                    onChange={(e) => setKg(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prendas">Prendas (unidades)</Label>
                  <Input
                    id="prendas"
                    type="number"
                    min="0"
                    value={prendas || ""}
                    onChange={(e) => setPrendas(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label htmlFor="turno">Turno preferido</Label>
                <Select value={turno} onValueChange={setTurno}>
                  <SelectTrigger id="turno">
                    <SelectValue placeholder="Seleccioná un turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hoy 16:00–18:00">Hoy 16:00–18:00</SelectItem>
                    <SelectItem value="Hoy 18:00–20:00">Hoy 18:00–20:00</SelectItem>
                    <SelectItem value="Mañana 10:00–12:00">Mañana 10:00–12:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ej: sin suavizante, prenda delicada..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Price Estimate */}
              <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Precio estimado:</span>
                  <span className="text-3xl font-bold text-accent">${estimatedPrice}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasServices || kg > 0 || prendas > 0
                    ? `Tiempo estimado: ${kg > 3 ? "24-48" : "12-24"} horas`
                    : "Seleccioná servicios para ver el presupuesto"}
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full text-lg py-6"
                disabled={!hasServices && kg === 0 && prendas === 0}
              >
                Confirmar pedido (demo)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
