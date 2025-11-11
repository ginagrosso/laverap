import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-laundry.jpg";

export const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
          Laverap
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-4">
          Tu lavandería, sin vueltas.
        </p>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
          Solicitá, seguí y pagá en el local. Todo en un solo lugar.
        </p>

        <Button
          size="lg"
          asChild
          className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg transition-all hover:scale-105"
        >
          <Link to={isAuthenticated ? "/order/new" : "/register"}>
            {isAuthenticated ? "Crear mi pedido" : "Comenzar ahora"}
          </Link>
        </Button>
      </div>
    </section>
  );
};
