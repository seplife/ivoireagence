import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "2250779535795";
const DEFAULT_MESSAGE =
  "Bonjour, je viens de IvoireImmobilier et j'aimerais parler à un expert.";

interface Props {
  message?: string;
  label?: string;
}

export default function WhatsAppFloat({ message = DEFAULT_MESSAGE, label = "Parler à un expert" }: Props) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-95 md:bottom-6 md:right-6"
      style={{ boxShadow: "0 10px 25px -5px rgba(37, 211, 102, 0.5)" }}
    >
      <MessageCircle className="h-5 w-5" fill="currentColor" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
