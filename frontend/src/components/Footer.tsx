import { MapPin, Phone, Clock } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
          {/* Sobre Laverap */}
          <div>
            <h3 className="text-2xl font-bold mb-2">Laverap</h3>
            <p className="text-sm opacity-90">Tu lavandería, sin vueltas.</p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Contacto</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/izz53TqMz9xPjZEv7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Av. 9 de Julio 3899, H3500 Resistencia, Chaco
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a
                  href="https://wa.me/5493625232218"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  362 5232218
                </a>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios de atención
            </h4>
            <div className="text-sm space-y-1">
              <p>Lunes a Jueves: 8:00-12:00 / 16:00-20:00</p>
              <p>Viernes: 8:00-17:00</p>
              <p className="opacity-75">Sábado y Domingo: Cerrado</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 pt-3 text-center text-sm opacity-75">
          <p>&copy; {new Date().getFullYear()} Laverap - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
};
