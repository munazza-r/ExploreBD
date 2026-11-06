import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { sendMessage, fetchMessages } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import { Send, Lock } from "lucide-react";

const CONVERSATION_ID = "demo-1"; // in a full merge, this would be per-booking

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function load() {
    try { setMessages(await fetchMessages(CONVERSATION_ID)); } catch (err) {}
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ conversationId: CONVERSATION_ID, content: input });
    setInput("");
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar active="Messages" />
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Shared conversation</p>
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <Lock size={12} /> Phone numbers hidden until payment
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderName === user?.name ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${m.senderName === user?.name ? "bg-green-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  <p className="text-[10px] opacity-70 mb-0.5">{m.senderName}</p>
                  <p>{m.content}</p>
                  {m.wasFiltered && <p className="text-[10px] opacity-70 mt-1">🔒 filtered for safety</p>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none" />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white p-2.5 rounded-full"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
