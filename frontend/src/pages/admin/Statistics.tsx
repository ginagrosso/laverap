import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

// TODO: Replace with actual API data
const mockRevenueData = [
  { mes: "Jun", ingresos: 28000, pedidos: 45 },
  { mes: "Jul", ingresos: 32000, pedidos: 52 },
  { mes: "Ago", ingresos: 35000, pedidos: 58 },
  { mes: "Sep", ingresos: 38000, pedidos: 61 },
  { mes: "Oct", ingresos: 42000, pedidos: 68 },
];

const mockServiceData = [
  { servicio: "Lavado Express", cantidad: 125, ingresos: 100000 },
  { servicio: "Planchado", cantidad: 89, ingresos: 13350 },
  { servicio: "Secado", cantidad: 76, ingresos: 45600 },
  { servicio: "Lavado Delicado", cantidad: 34, ingresos: 10200 },
];

export default function Statistics() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Estadísticas y Reportes</h1>
          <p className="text-lg opacity-90">Análisis de rendimiento del negocio</p>
        </div>
      </section>

      {/* Charts */}
      <section className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>Evolución mensual de ingresos y cantidad de pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ingresos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Ingresos ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pedidos"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Pedidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Servicio</CardTitle>
              <CardDescription>Cantidad de pedidos por tipo de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockServiceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="servicio" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="hsl(var(--primary))" name="Cantidad de Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Servicio</CardTitle>
              <CardDescription>Distribución de ingresos según tipo de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockServiceData.map((service, idx) => {
                  const total = mockServiceData.reduce((sum, s) => sum + s.ingresos, 0);
                  const percentage = ((service.ingresos / total) * 100).toFixed(1);

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{service.servicio}</span>
                        <span className="text-muted-foreground">
                          ${service.ingresos.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Pedidos (Mes)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {mockServiceData.reduce((sum, s) => sum + s.cantidad, 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  ${mockServiceData.reduce((sum, s) => sum + s.ingresos, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ticket Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  ${Math.round(
                    mockServiceData.reduce((sum, s) => sum + s.ingresos, 0) /
                    mockServiceData.reduce((sum, s) => sum + s.cantidad, 0)
                  ).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
