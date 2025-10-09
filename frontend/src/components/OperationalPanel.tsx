import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Package, Loader2, CheckCircle, AlertCircle, Archive } from "lucide-react";

const mockOrders = {
  recibido: [
    { id: "LVR-1001", cliente: "Juan P.", prendas: 5 },
    { id: "LVR-1002", cliente: "María G.", prendas: 8 },
  ],
  proceso: [
    { id: "LVR-0998", cliente: "Carlos R.", prendas: 12 },
    { id: "LVR-0999", cliente: "Ana S.", prendas: 6 },
    { id: "LVR-1000", cliente: "Luis M.", prendas: 4 },
  ],
  listo: [
    { id: "LVR-0997", cliente: "Sofia L.", prendas: 7 },
  ],
};

export const OperationalPanel = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Panel operativo</h2>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Vista previa del tablero de operaciones
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Column: Recibido */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-blue-500" />
                Recibido
                <Badge variant="secondary">{mockOrders.recibido.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockOrders.recibido.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="font-semibold text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.cliente}</p>
                  <p className="text-xs">{order.prendas} prendas</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Column: En proceso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                En proceso
                <Badge variant="secondary">{mockOrders.proceso.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockOrders.proceso.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <p className="font-semibold text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.cliente}</p>
                  <p className="text-xs">{order.prendas} prendas</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Column: Listo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Listo
                <Badge variant="secondary">{mockOrders.listo.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockOrders.listo.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="font-semibold text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.cliente}</p>
                  <p className="text-xs">{order.prendas} prendas</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-semibold">Incidencias</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Archive className="w-8 h-8 text-slate-500" />
                <div>
                  <p className="font-semibold">Inventario</p>
                  <p className="text-sm text-muted-foreground">Jabón: OK | Suavizante: OK</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
