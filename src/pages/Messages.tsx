import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  property_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  contact_id: string;
  contact_name: string;
  last_message: string;
  last_date: string;
  unread_count: number;
  property_id: string | null;
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedContactParam = searchParams.get("contact");
  const propertyParam = searchParams.get("property");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(selectedContactParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [contactProfiles, setContactProfiles] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) return;

      // Group by contact
      const convMap = new Map<string, Conversation>();
      for (const msg of msgs) {
        const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(contactId)) {
          convMap.set(contactId, {
            contact_id: contactId,
            contact_name: "",
            last_message: msg.message,
            last_date: msg.created_at,
            unread_count: 0,
            property_id: msg.property_id,
          });
        }
        if (!msg.is_read && msg.receiver_id === user.id) {
          const conv = convMap.get(contactId)!;
          conv.unread_count++;
        }
      }

      // Fetch profiles for contacts
      const contactIds = Array.from(convMap.keys());
      if (contactIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", contactIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach((p) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Utilisateur";
          profileMap[p.user_id] = name;
        });
        setContactProfiles((prev) => ({ ...prev, ...profileMap }));

        convMap.forEach((conv, id) => {
          conv.contact_name = profileMap[id] || "Utilisateur";
        });
      }

      setConversations(Array.from(convMap.values()));
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!user || !selectedContact) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);

      // Mark as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", selectedContact);
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${selectedContact}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedContact) ||
            (msg.sender_id === selectedContact && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
            if (msg.receiver_id === user.id) {
              supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch contact name if coming from URL param
  useEffect(() => {
    if (selectedContactParam && !contactProfiles[selectedContactParam]) {
      supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .eq("user_id", selectedContactParam)
        .single()
        .then(({ data }) => {
          if (data) {
            const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "Utilisateur";
            setContactProfiles((prev) => ({ ...prev, [data.user_id]: name }));
          }
        });
    }
  }, [selectedContactParam]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedContact || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedContact,
      message: newMessage.trim(),
      property_id: propertyParam || null,
    });
    setNewMessage("");
    setSending(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center text-muted-foreground">Chargement...</div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">Connectez-vous pour accéder à vos messages</p>
          <Link to="/connexion" className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            Se connecter
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const contactName = selectedContact ? contactProfiles[selectedContact] || "Utilisateur" : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <h1 className="mb-6 font-display text-2xl text-foreground">Messages</h1>

        <div className="grid gap-4 lg:grid-cols-3" style={{ minHeight: "60vh" }}>
          {/* Conversations list */}
          <div className={`rounded-2xl bg-card p-4 lg:col-span-1 ${selectedContact ? "hidden lg:block" : ""}`} style={{ boxShadow: "var(--shadow-sm)" }}>
            {conversations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune conversation</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.contact_id}
                    onClick={() => setSelectedContact(conv.contact_id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      selectedContact === conv.contact_id ? "bg-primary/10" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-foreground">{conv.contact_name}</p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{conv.last_message}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className={`flex flex-col rounded-2xl bg-card lg:col-span-2 ${!selectedContact ? "hidden lg:flex" : "flex"}`} style={{ boxShadow: "var(--shadow-sm)" }}>
            {selectedContact ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <button onClick={() => setSelectedContact(null)} className="lg:hidden">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">{contactName}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "50vh" }}>
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`mt-1 text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrire un message..."
                      className="h-11 flex-1 rounded-xl bg-secondary px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
