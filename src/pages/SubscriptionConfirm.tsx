import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SubscriptionConfirm() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl text-foreground">Confirmation</h1>
      </div>
      <Footer />
    </div>
  );
}
