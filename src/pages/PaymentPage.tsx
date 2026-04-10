// src/pages/PaymentPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/data/mockProperties";

const METHODS = [
  { id: "orange_money",  label: "Orange Money",  short: "OM",  bg: "#FF6B00", color: "#fff" },
  { id: "mtn_momo",      label: "MTN MoMo",      short: "MTN", bg: "#FFCC00", color: "#333" },
  { id: "wave",          label: "Wave",           short: "W",   bg: "#1A56DB", color: "#fff" },
  { id: "card",          label: "Carte bancaire", short: "CB",  bg: "#f0f0f0", color: "#555" },
];

export default function PaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [method, setMethod] = useState("orange_money");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Charger la facture
  useEffect(() => {
    if (!invoiceId) return;
    supabase
      .from("invoices")
      .select("*, properties(title, commune, city, status)")
      .eq("id", invoiceId)
      .single()
      .then(({ data }) => {
        setInvoice(data);
        if (data?.status === "paid") setConfirmed(true);
      });
  }, [invoiceId]);

  // Écouter la confirmation de paiement en temps réel
  useEffect(() => {
    if (!invoiceId || confirmed) return;
    const channel = supabase
      .channel(`invoice-status-${invoiceId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "invoices",
        filter: `id=eq.${invoiceId}`,
      }, (payload) => {
        if (payload.new.status === "paid") {
          setConfirmed(true);
          toast.success("Paiement confirmé ! Votre annonce est maintenant visible.");
          setTimeout(() => navigate(`/annonce/${payload.new.listing_id}`), 2000);
        }
        if (payload.new.status === "failed") {
          toast.error("Paiement échoué. Réessayez ou choisissez une autre méthode.");
          setLoading(false);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [invoiceId, confirmed]);

  const handlePay = async () => {
    if (!invoice || !user) return;
    setLoading(true);
    try {
      // Appeler l'Edge Function qui crée la session CinetPay
      const { data, error } = await supabase.functions.invoke("initiate-payment", {
        body: { invoice_id: invoice.id, payment_method: method },
      });
      if (error) throw error;
      // Rediriger vers la page de paiement CinetPay
      window.location.href = data.payment_url;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'initiation du paiement");
      setLoading(false);
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-xl">
        <Link to="/annonces" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        {confirmed ? (
          <div className="rounded-2xl bg-card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-light mb-4">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-xl text-foreground">Paiement confirmé !</h1>
            <p className="mt-2 text-sm text-muted-foreground">Votre annonce est maintenant visible publiquement.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-6 space-y-5">
            {/* Récapitulatif */}
            <div>
              <h1 className="font-display text-xl text-foreground mb-1">Paiement de l'annonce</h1>
              <p className="text-sm text-muted-foreground">{invoice.properties?.title}</p>
            </div>

            <div className="rounded-xl bg-secondary p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Publication</span>
                <span className="text-foreground">{formatPrice(invoice.amount)} FCFA</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>{formatPrice(invoice.amount)} FCFA</span>
              </div>
            </div>

            {/* Méthodes */}
            <div className="space-y-2">
              {METHODS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    method === m.id
                      ? "border-accent bg-saffron-light"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="h-8 w-12 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: m.bg, color: m.color }}>
                    {m.short}
                  </div>
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                  <div className={`ml-auto h-4 w-4 rounded-full border-2 ${
                    method === m.id ? "border-accent bg-accent" : "border-border"
                  }`} />
                </div>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-accent-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion au gateway...</>
                : `Payer ${formatPrice(invoice.amount)} FCFA`
              }
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Paiement sécurisé · Votre annonce s'active instantanément après confirmation
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
