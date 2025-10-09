import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "¿Cómo se calcula el precio?",
    answer:
      "El precio se calcula según los servicios seleccionados (lavado, secado, planchado, delicado) más un costo variable por kilogramo y por prenda. En el formulario de estimación podés ver el precio exacto antes de confirmar tu pedido.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos efectivo y transferencia bancaria. El pago se realiza en el local al momento de retirar tu ropa, no necesitás pagar por adelantado. Te compartimos el CBU si elegís transferencia.",
  },
  {
    question: "¿Trabajan con prendas delicadas?",
    answer:
      "Sí, ofrecemos un servicio especial para prendas delicadas que requieren cuidado extra. Podés indicarlo al crear tu pedido y dejar observaciones específicas sobre cómo tratar cada prenda.",
  },
  {
    question: "¿Cómo me notifican cuando está listo?",
    answer:
      "Podés seguir el estado de tu pedido en tiempo real desde la plataforma. Cuando tu ropa esté lista para retirar, el estado cambiará automáticamente a 'Listo' y recibirás una notificación.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-4">Preguntas frecuentes</h2>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Resolvé tus dudas
        </p>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-background"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
