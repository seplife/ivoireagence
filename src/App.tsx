import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import PublishListing from "./pages/PublishListing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import PaymentPage from "@/pages/PaymentPage";
import PricingPage from "@/pages/PricingPage";
import MesFactures from "@/pages/MesFactures";
import SubscriptionConfirm from "@/pages/SubscriptionConfirm";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/annonces" element={<Listings />} />
            <Route path="/annonce/:id" element={<PropertyDetail />} />
            <Route path="/publier" element={<PublishListing />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/paiement/:invoiceId" element={<PaymentPage />} />
            <Route path="/abonnement" element={<PricingPage />} />
            <Route path="/abonnement/confirmation" element={<SubscriptionConfirm />} />
            <Route path="/mes-factures" element={<MesFactures />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppFloat />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
