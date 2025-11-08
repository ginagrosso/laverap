import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getRevenue, getPopularServices } from "@/lib/reports";
import { Loader2, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function Statistics() {
  const { token } = useAuth();

  // Calculate date range for last 6 months (as stable strings)
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const startDate = sixMonthsAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ["reports", "revenue-chart", startDate, endDate], // Use stable strings instead of Date objects
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return getRevenue(startDate, endDate, token);
    },
    enabled: !!token,
  });

  // Fetch popular services
  const { data: servicesData, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ["reports", "popular-services"],
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return getPopularServices(10, token);
    },
    enabled: !!token,
  });

  const isLoading = revenueLoading || servicesLoading;
  const hasError = revenueError || servicesError;

  // Transform revenue API data to chart format
  const revenueChartData = revenueData?.ingresosPorMes.map(item => {
    // Convert "YYYY-MM" to abbreviated month name
    const [, month] = item.mes.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = monthNames[parseInt(month) - 1];

    return {
      mes: monthName,
      ingresos: item.ingreso,
      pedidos: item.cantidad,
    };
  }) || [];

  // Transform services API data to chart format
  const serviceChartData = servicesData?.topServicios.map(item => ({
    servicio: item.nombre,
    cantidad: item.cantidad,
    ingresos: item.ingresoTotal,
  })) || [];

  // Calculate totals
  const totalOrders = serviceChartData.reduce((sum, s) => sum + s.cantidad, 0);
  const totalRevenue = serviceChartData.reduce((sum, s) => sum + s.ingresos, 0);
  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Estadísticas y Reportes</h1>
          <p className="text-lg opacity-90">Análisis de rendimiento del negocio</p>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/dashboard" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Estadísticas y Reportes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Charts */}
      <section className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {hasError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              Error al cargar las estadísticas. Por favor, intenta recargar la página.
            </div>
          )}

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ingresos</CardTitle>
              <CardDescription>Evolución mensual de ingresos y cantidad de pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No hay datos de ingresos disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Servicio</CardTitle>
              <CardDescription>Cantidad de pedidos por tipo de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : serviceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="servicio" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="hsl(var(--primary))" name="Cantidad de Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No hay datos de servicios disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Servicio</CardTitle>
              <CardDescription>Distribución de ingresos según tipo de servicio</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : serviceChartData.length > 0 ? (
                <div className="space-y-4">
                  {serviceChartData.map((service, idx) => {
                    const percentage = totalRevenue > 0
                      ? ((service.ingresos / totalRevenue) * 100).toFixed(1)
                      : '0.0';

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
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No hay datos de servicios disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-4xl font-bold">{totalOrders}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-4xl font-bold">${totalRevenue.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ticket Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-4xl font-bold">${averageTicket.toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
