import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { sendMessage, fetchMessages } from "../api/messageApi";
import { Send, Lock } from "lucide-react";

const CONVERSATION_ID = "demo-1";
const CURRENT_USER = { name: "Sarah Ahmed", role: "TOURIST" };
const CONTACT_UNLOCKED = false; // flips to true once booking payment is confirmed

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // simple polling for "live" feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    try {
      const data = await fetchMessages(CONVERSATION_ID);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await sendMessage({
        conversationId: CONVERSATION_ID,
        senderName: CURRENT_USER.name,
        senderRole: CURRENT_USER.role,
        content: input,
        contactUnlocked: CONTACT_UNLOCKED,
      });
      setInput("");
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar active="Messages" />

      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Muntasir Rahman</p>
              <p className="text-xs text-gray-500">Sundarbans day tour</p>
            </div>
            {!CONTACT_UNLOCKED && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Lock size={12} /> Contact info hidden until payment
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderRole === CURRENT_USER.role ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    m.senderRole === CURRENT_USER.role
                      ? "bg-green-700 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p>{m.content}</p>
                  {m.wasFiltered && <p className="text-[10px] opacity-70 mt-1">🔒 filtered for safety</p>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white p-2.5 rounded-full">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
