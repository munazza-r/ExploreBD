import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Lock, Search, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import { fetchMessages, sendMessage } from "../api/messageApi";

const CONVERSATION_ID = "demo-1";
const CURRENT_USER = { name: "Muntasir Rahman", role: "GUIDE" };
const CONTACT_UNLOCKED = false;

const conversations = [
  { id: "demo-1", initials: "AK", name: "Ayesha Karim", preview: "When are you available this weekend...?", time: "Today" },
  { id: "demo-2", initials: "RI", name: "Rafiul Islam", preview: "Thank you! For choosing me in your trip.", time: "10:50 PM" },
  { id: "demo-3", initials: "PS", name: "Priya Sharma", preview: "It was a great journey with you! Thanks", time: "Monday" },
  { id: "demo-4", initials: "JW", name: "James Whitefield", preview: "When are you available this weekend...?", time: "Friday" },
  { id: "demo-5", initials: "TH", name: "Tanvir Hossain", preview: "When are you available this weekend...?", time: "10/7/24" },
  { id: "demo-6", initials: "SK", name: "Salmon Khan", preview: "When are you available this weekend...?", time: "10/5/24" },
];

function formatTime(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatConversationDate(value) {
  if (!value) return "Today";

  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(date);

  return isToday ? `Today, ${formattedDate}` : formattedDate;
}

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState(CONVERSATION_ID);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef(null);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) =>
      `${conversation.name} ${conversation.preview}`.toLowerCase().includes(query),
    );
  }, [search]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
    [activeConversationId],
  );

  useEffect(() => {
    let isActive = true;

    setMessages([]);
    setIsLoading(true);
    setError("");

    async function loadMessages({ silent = false } = {}) {
      try {
        const data = await fetchMessages(activeConversationId);
        if (!isActive) return;
        setMessages(data);
        setError("");
      } catch (requestError) {
        console.error(requestError);
        if (isActive && !silent) setError("Messages could not be loaded. Please try again.");
      } finally {
        if (isActive && !silent) setIsLoading(false);
      }
    }

    loadMessages();
    const interval = setInterval(() => loadMessages({ silent: true }), 5000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [activeConversationId]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setError("");

    try {
      const result = await sendMessage({
        conversationId: activeConversationId,
        senderName: CURRENT_USER.name,
        senderRole: CURRENT_USER.role,
        content,
        contactUnlocked: CONTACT_UNLOCKED,
      });

      setMessages((currentMessages) => [...currentMessages, result.message]);
      setInput("");
    } catch (requestError) {
      console.error(requestError);
      setError("Message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3fafc] text-[#182033]">
      <Navbar active="Messages" />

      <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <section className="mx-auto flex h-[calc(100vh-7.5rem)] min-h-[600px] max-h-[720px] max-w-[1180px] overflow-hidden rounded-[16px] border border-[#d6dce0] bg-white shadow-[0_5px_20px_rgba(18,31,43,0.22)]">
          <aside className="hidden w-[31%] min-w-[330px] flex-col border-r-[5px] border-[#edf0f3] bg-white md:flex">
            <div className="px-5 pb-3 pt-5 lg:px-6">
              <h1 className="mb-4 text-[22px] font-semibold tracking-[-0.02em] text-[#151d2e]">Messages</h1>
              <label className="flex h-12 items-center gap-2.5 rounded-lg border border-[#cbd3da] bg-[#f9fbfc] px-4 text-[#8d98a6] shadow-[0_3px_5px_rgba(31,41,55,0.2)] focus-within:border-[#7b8794]">
                <Search size={14} strokeWidth={1.8} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversation..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#344054] outline-none placeholder:text-[#a3acb8]"
                />
              </label>
            </div>

            <div className="message-scroll flex-1 space-y-4 overflow-y-auto px-4 py-3 lg:px-5">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => setActiveConversationId(conversation.id)}
                    className="flex w-full items-center gap-3 text-left"
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Open conversation with ${conversation.name}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#118b88] text-[11px] font-semibold text-white">
                      {conversation.initials}
                    </span>
                    <span
                      className={`min-w-0 flex-1 rounded-lg px-3.5 py-2.5 shadow-[0_3px_7px_rgba(31,41,55,0.17)] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(31,41,55,0.2)] ${
                        isActive ? "bg-[#eef9f6] ring-1 ring-[#7dd8c4]" : "bg-[#f8fafb]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-semibold text-[#111827]">{conversation.name}</span>
                        <span className="shrink-0 text-[8px] text-[#7d8793]">{conversation.time}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] text-[#8f9aa8]">{conversation.preview}</span>
                    </span>
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-[#8a95a3]">No conversations found.</p>
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 items-center bg-[#fcfdfe] px-4 py-8 sm:px-6 lg:px-7">
            <article className="mx-auto flex h-[calc(100%_-_3rem)] min-h-[500px] max-h-[590px] w-full max-w-[780px] min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#d9dee3] bg-white shadow-[0_5px_14px_rgba(30,41,59,0.2)]">
              <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-[#edf0f2] px-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#109574] text-[11px] font-semibold text-white">
                    {activeConversation.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-[#172033]">
                      {activeConversation.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#87919d]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#21d6a2]" /> Online · Tourist
                    </span>
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {!CONTACT_UNLOCKED && (
                    <span className="hidden items-center gap-1 rounded-full border border-[#f5c54c] bg-[#fffdf5] px-3 py-1.5 text-[9px] font-medium text-[#e29900] sm:flex">
                      <Lock size={10} /> Phone numbers hidden until payment
                    </span>
                  )}
                  <ChevronRight size={17} className="text-[#aab3be]" />
                </div>
              </header>

              <div
                ref={messageListRef}
                className="message-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fbfdfe] px-4 py-4 sm:px-5"
              >
                {messages.length > 0 && (
                  <div className="mb-3 flex items-center gap-3 text-[9px] text-[#a1a9b3]">
                    <span className="h-px flex-1 bg-[#eef1f3]" />
                    <span>{formatConversationDate(messages[0].createdAt)}</span>
                    <span className="h-px flex-1 bg-[#eef1f3]" />
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center text-xs text-[#8d98a5]">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-center text-xs text-[#8d98a5]">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderRole === CURRENT_USER.role;

                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[82%] px-4 py-3 text-[13px] leading-[1.55] sm:max-w-[72%] ${
                              isOwnMessage
                                ? "rounded-[14px] rounded-br-[5px] bg-[#2f7df4] text-white shadow-[0_2px_5px_rgba(47,125,244,0.25)]"
                                : "rounded-[14px] rounded-bl-[5px] border border-[#edf0f2] bg-white text-[#435064] shadow-[0_2px_5px_rgba(30,41,59,0.16)]"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            {message.wasFiltered && (
                              <p className={`mt-1.5 text-[8px] ${isOwnMessage ? "text-blue-100" : "text-amber-600"}`}>
                                Contact information filtered for safety
                              </p>
                            )}
                          </div>
                          <span className="mt-1 px-1 text-[8px] text-[#9aa4af]">{formatTime(message.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && <p className="bg-red-50 px-4 py-1 text-center text-[10px] text-red-600">{error}</p>}

              <form onSubmit={handleSend} className="flex h-[70px] shrink-0 items-center gap-3 border-t border-[#edf0f2] bg-white px-4 sm:px-5">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  aria-label="Message"
                  className="h-11 min-w-0 flex-1 rounded-full border border-[#d5dbe1] bg-[#f5f7f9] px-5 text-[13px] text-[#344054] outline-none transition focus:border-[#8aaee9] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f7df4] text-white shadow-[0_3px_6px_rgba(47,125,244,0.35)] transition hover:bg-[#246de0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={17} />
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
