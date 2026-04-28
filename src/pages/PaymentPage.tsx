import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl text-foreground">Paiement</h1>
        <p className="mt-2 text-sm text-muted-foreground">Module de paiement bientôt disponible.</p>
      </div>
      <Footer />
    </div>
  );
}
