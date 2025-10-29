import { Hero } from "@/components/Hero";
import { EstimatorForm } from "@/components/EstimatorForm";
import { HowItWorks } from "@/components/HowItWorks";
import { OrderStatus } from "@/components/OrderStatus";
import { PaymentDemo } from "@/components/PaymentDemo";
import { OperationalPanel } from "@/components/OperationalPanel";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <EstimatorForm />
      <HowItWorks />
      <OrderStatus />
      <PaymentDemo />
      <OperationalPanel />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
