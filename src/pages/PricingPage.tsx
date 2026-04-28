import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl text-foreground">Tarifs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page en construction.</p>
      </div>
      <Footer />
    </div>
  );
}
