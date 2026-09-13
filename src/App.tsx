import { useState, useRef, useEffect } from "react";

type Role = "user" | "assistant";
type Theme = "dark" | "light";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  reaction?: "up" | "down";
}

interface Concept {
  id: string;
  label: string;
  title: string;
  description: string;
  example?: string;
  color: string;
}

const concepts: Concept[] = [
  {
    id: "prompt", label: "PROMPTS", title: "What is a prompt?", color: "#ff5f57",
    description: "A prompt is the instruction you give to an AI. The clearer and more specific your prompt, the better the response. Good prompts include context, desired format, and any constraints.",
    example: 'Instead of: "Write something about dogs"\nTry: "Write a 3-sentence description of golden retrievers for a pet adoption website, focusing on their temperament."',
  },
  {
    id: "memory", label: "MEMORY", title: "How AI memory works", color: "#22d3ee",
    description: "AI models don't have persistent memory between sessions — each conversation starts fresh. Within a session, the model sees the full conversation history as context, which is why earlier messages influence later responses.",
    example: 'Within a chat, you can say "refer back to the recipe you gave me" and the AI understands. But starting a new chat? Clean slate.',
  },
  {
    id: "context", label: "CONTEXT", title: "Context windows", color: "#b8ff3f",
    description: "Every AI model has a context window — the maximum amount of text it can read at once. Think of it as working memory. Once the window fills up, older messages may be dropped or summarized.",
    example: "Claude's context window can hold roughly 200,000 tokens — about 150,000 words — in a single conversation.",
  },
  {
    id: "ux", label: "UX PATTERNS", title: "Chatbot UX principles", color: "#ff9a3c",
    description: "Good chatbot UX keeps users informed: show typing indicators, stream responses, surface suggestions, and make it easy to start over. Reduce blank-slate anxiety with example prompts.",
    example: "Example starters, auto-scroll to latest message, clear visual distinction between user and AI turns.",
  },
];

const starterQuestions = [
  "What makes a good AI prompt?",
  "How does conversation memory work?",
  "What is a context window?",
  "How should I design a chatbot interface?",
  "Can you give me an example of prompt engineering?",
];

const followUps: Record<string, string[]> = {
  prompt: ["Can you give me a prompt template?", "What are common prompt mistakes?", "How do I write a role prompt?"],
  memory: ["How do external memory systems work?", "What happens when context fills up?", "Can AI learn from past chats?"],
  context: ["What is the longest context window?", "How do I manage long conversations?", "What gets dropped first?"],
  ux: ["What is a typing indicator?", "How should errors be shown in chatbots?", "What makes a great chat UI?"],
  "prompt engineering": ["What is few-shot prompting?", "How does chain-of-thought work?", "What is temperature in AI?"],
  default: ["Tell me about prompt engineering", "How does AI memory work?", "What is a context window?"],
};

const knowledgeBase: Record<string, string> = {
  prompt:
    `A prompt is the instruction or question you send to an AI model. The quality of your prompt directly shapes the quality of the response.\n\nEffective prompts share a few traits:\n• **Be specific** — vague questions get vague answers\n• **Provide context** — tell the AI who it's for, what format you need, and any constraints\n• **Iterate** — refine your prompt based on responses\n\nFor example, instead of *"Explain marketing,"* try *"Explain content marketing in 3 bullet points for a non-profit with a $500/month budget."*`,
  memory:
    `AI models like me don't have memory between separate conversations — each chat starts fresh.\n\nWithin a single conversation, though, I can see everything we've discussed. That's called the **conversation context**. It means I can refer back to what you said earlier, build on previous answers, and maintain continuity throughout our chat.\n\nSome products add external memory systems — storing summaries or facts across sessions — but that's an application-layer feature, not built into the model itself.`,
  context:
    `A context window is the total amount of text — your messages and my responses — that I can read at once during a conversation.\n\nThink of it like a desk: I can only work with what's on the desk. If the conversation grows too long, older messages fall off the edge.\n\nClaude's context window is approximately **200,000 tokens** (about 150,000 words), which is quite large. Smaller models may have windows of 4,000–32,000 tokens. This limit shapes how much history I can use when responding.`,
  ux:
    `Chatbot UX has a few proven patterns that reduce friction and build trust:\n\n• **Typing indicators** — show the AI is working, not frozen\n• **Streaming responses** — display text as it generates rather than showing it all at once\n• **Starter prompts** — reduce blank-slate anxiety with suggested questions\n• **Clear role distinction** — visually separate user and AI messages\n• **Easy reset** — let users start fresh without friction\n• **Error states** — communicate failures clearly and offer recovery options\n\nThe best chatbot interfaces feel conversational, not form-like.`,
  "prompt engineering":
    `Prompt engineering is the practice of crafting inputs to get better outputs from AI models.\n\nKey techniques include:\n\n**Role prompting** — *"Act as a senior product manager and review this feature spec."*\n\n**Few-shot examples** — Give the model 2–3 examples of the pattern you want before asking it to continue.\n\n**Chain of thought** — Ask the model to *"think step by step"* before answering, which improves reasoning accuracy.\n\n**Delimiters** — Use markers like triple backticks or XML tags to clearly separate instructions from content.\n\n**Temperature** — Not in the prompt itself, but a parameter that controls how creative vs. deterministic the output is.`,
  default:
    `Great question. Here's what I can tell you:\n\nI'm a Q&A assistant focused on helping you understand how AI works — specifically prompts, memory, context windows, and chatbot UX design.\n\nFeel free to ask about:\n• Writing better prompts\n• How AI memory and context work\n• Chatbot interface design patterns\n• Prompt engineering techniques\n\nOr pick one of the suggested questions below the input.`,
};

function getTopicKey(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("prompt engineer")) return "prompt engineering";
  if (lower.includes("prompt") || lower.includes("instruction")) return "prompt";
  if (lower.includes("memory") || lower.includes("remember") || lower.includes("forget")) return "memory";
  if (lower.includes("context") || lower.includes("window") || lower.includes("token")) return "context";
  if (lower.includes("ux") || lower.includes("interface") || lower.includes("design") || lower.includes("chatbot")) return "ux";
  return "default";
}

function getResponse(input: string): string {
  return knowledgeBase[getTopicKey(input)];
}

function getFollowUps(input: string): string[] {
  return followUps[getTopicKey(input)] ?? followUps["default"];
}

// ── Icons ──
function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function DownloadIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {["#ff5f57","#ff9a3c","#22d3ee"].map((color, i) => (
        <span key={i} className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: color, animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  onReact,
  searchQuery,
}: {
  message: Message;
  onReact: (id: string, r: "up" | "down") => void;
  searchQuery: string;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: "#ff9a3c55", borderRadius: "2px", padding: "0 1px" }}>
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|•[^\n]+|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold" style={{ color: isUser ? "#fff" : "var(--primary)" }}>{highlight(part.slice(2, -2))}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{highlight(part.slice(1, -1))}</em>;
      if (part.startsWith("•")) {
        return (
          <span key={i} className="flex gap-2 mt-1">
            <span style={{ color: isUser ? "#ffcfcd" : "var(--primary)" }}>•</span>
            <span>{highlight(part.slice(1).trim())}</span>
          </span>
        );
      }
      return <span key={i}>{highlight(part)}</span>;
    });
  };

  const ts = message.timestamp;
  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`message-appear flex ${isUser ? "justify-end" : "justify-start"} mb-5 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isUser && (
        <div
          className="ai-glow w-8 h-8 rounded-full flex items-center justify-center mr-2.5 mt-0.5 shrink-0 text-xs font-mono font-bold"
          style={{ background: "linear-gradient(135deg,#ff5f57,#ff9a3c)", color: "#fff" }}
        >
          AI
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={{
            background: isUser ? "linear-gradient(135deg,#ff5f57,#ff9a3c)" : "var(--card)",
            color: isUser ? "#fff" : "var(--card-foreground)",
            border: isUser ? "none" : "1px solid var(--border)",
            boxShadow: isUser ? "0 6px 24px var(--shadow-glow)" : "none",
            whiteSpace: "pre-wrap",
          }}
        >
          <div className="flex flex-col gap-0.5">
            {message.content.split("\n").map((line, i) => (
              <span key={i}>{renderContent(line)}</span>
            ))}
          </div>

          {/* Copy button — appears on hover */}
          <button
            onClick={handleCopy}
            className="absolute -top-2 transition-all duration-150"
            style={{
              right: isUser ? "auto" : "-2px",
              left: isUser ? "-2px" : "auto",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1)" : "scale(0.8)",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "3px 6px",
              color: copied ? "#b8ff3f" : "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "10px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="font-mono">{copied ? "copied" : "copy"}</span>
          </button>
        </div>

        {/* Timestamp + reactions (AI only) */}
        <div
          className="flex items-center gap-2 mt-1.5 transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0.4 }}
        >
          <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{timeStr}</span>
          {!isUser && (
            <div className="flex gap-1">
              {(["up", "down"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onReact(message.id, r)}
                  className="text-xs px-1.5 py-0.5 rounded-md transition-all duration-150"
                  style={{
                    background: message.reaction === r
                      ? r === "up" ? "#b8ff3f22" : "#ff5f5722"
                      : "var(--muted)",
                    border: `1px solid ${message.reaction === r ? (r === "up" ? "#b8ff3f" : "#ff5f57") : "var(--border)"}`,
                    color: message.reaction === r ? (r === "up" ? "#b8ff3f" : "#ff5f57") : "var(--muted-foreground)",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {r === "up" ? "👍" : "👎"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center ml-2.5 mt-0.5 shrink-0 text-xs font-semibold"
          style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" }}
        >
          U
        </div>
      )}
    </div>
  );
}

function FollowUpChips({ suggestions, onSelect }: { suggestions: string[]; onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2 mt-1">
      {suggestions.map((s, i) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="chip-hover text-xs px-3 py-1.5 rounded-xl"
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
            border: "1.5px solid var(--border)",
            animation: `fadeSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s forwards`,
            opacity: 0,
          }}
        >
          ↗ {s}
        </button>
      ))}
    </div>
  );
}

function ConceptCard({ concept, active, onClick }: { concept: Concept; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        background: active ? "var(--secondary)" : "transparent",
        border: `1.5px solid ${active ? concept.color : "var(--border)"}`,
        boxShadow: active ? `0 0 20px ${concept.color}28` : "none",
        transform: active ? "translateX(3px)" : "none",
      }}
    >
      <div className="text-xs font-mono tracking-widest mb-1 font-medium" style={{ color: active ? concept.color : "var(--muted-foreground)" }}>
        {concept.label}
      </div>
      <div className="text-sm font-medium leading-snug" style={{ color: active ? "var(--foreground)" : "var(--secondary-foreground)" }}>
        {concept.title}
      </div>
    </button>
  );
}

function ConceptDetail({ concept }: { concept: Concept }) {
  return (
    <div
      className="bounce-in rounded-2xl p-4 mt-2"
      style={{ background: "var(--muted)", border: `1.5px solid ${concept.color}40`, boxShadow: `0 4px 24px ${concept.color}14` }}
    >
      <p className="text-sm leading-relaxed" style={{ color: "var(--card-foreground)" }}>{concept.description}</p>
      {concept.example && (
        <div className="mt-3 rounded-xl p-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="text-xs font-mono tracking-widest mb-2" style={{ color: concept.color }}>EXAMPLE</div>
          <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--muted-foreground)", whiteSpace: "pre-wrap" }}>{concept.example}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "assistant", timestamp: new Date(),
    content: "Hello! I'm your AI learning assistant.\n\nAsk me anything about how AI works — prompts, memory, context windows, or chatbot design. Or pick a concept from the Learn panel to explore it interactively.",
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "learn">("chat");
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, followUpSuggestions]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setCharCount(0);
    setFollowUpSuggestions([]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: getResponse(text), timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setFollowUpSuggestions(getFollowUps(text));
    }, 900 + Math.random() * 600);
  };

  const handleReact = (id: string, reaction: "up" | "down") => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, reaction: m.reaction === reaction ? undefined : reaction } : m));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now().toString(), role: "assistant", timestamp: new Date(), content: "Chat cleared. Fresh start — what would you like to learn about AI?" }]);
    setFollowUpSuggestions([]);
  };

  const exportChat = () => {
    const text = messages.map((m) => `[${m.role.toUpperCase()} — ${m.timestamp.toLocaleTimeString()}]\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "chat-export.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const displayedMessages = searchQuery.trim() ? filteredMessages : messages;

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col bg-scene" style={{ color: "var(--foreground)" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--border)", background: isDark ? "rgba(14,14,18,0.82)" : "rgba(253,252,248,0.88)", backdropFilter: "blur(14px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="ai-glow w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold" style={{ background: "linear-gradient(135deg,#ff5f57,#ff9a3c)", color: "#fff" }}>
            AI
          </div>
          <div>
            <h1 className="font-serif text-lg leading-none gradient-text">Q&A Assistant</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Learn prompts, memory &amp; UX</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
            {messages.length - 1} msgs
          </span>

          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="theme-toggle w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: searchOpen ? "var(--primary)" : "var(--secondary)", border: "1.5px solid var(--border)", color: searchOpen ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
            title="Search messages"
          >
            <SearchIcon />
          </button>

          {/* Export */}
          <button
            onClick={exportChat}
            className="theme-toggle w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--secondary)", border: "1.5px solid var(--border)", color: "var(--muted-foreground)" }}
            title="Export chat"
          >
            <DownloadIcon />
          </button>

          {/* Clear */}
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "var(--primary)"; el.style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--secondary-foreground)"; }}
          >
            Clear
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="theme-toggle w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? "linear-gradient(135deg,#22d3ee22,#b8ff3f22)" : "linear-gradient(135deg,#ff5f5722,#ff9a3c22)", border: "1.5px solid var(--border)", color: isDark ? "#22d3ee" : "#e8352a" }}
            title={isDark ? "Switch to light" : "Switch to dark"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Search bar */}
      {searchOpen && (
        <div
          className="bounce-in flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: "var(--border)", background: isDark ? "rgba(14,14,18,0.92)" : "rgba(253,252,248,0.95)" }}
        >
          <SearchIcon />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--foreground)", caretColor: "var(--primary)", fontFamily: "inherit" }}
          />
          {searchQuery && (
            <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
              {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""}
            </span>
          )}
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ color: "var(--muted-foreground)", cursor: "pointer" }}>
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Mobile tabs */}
      <div
        className="flex border-b md:hidden"
        style={{ borderColor: "var(--border)", background: isDark ? "rgba(14,14,18,0.9)" : "rgba(253,252,248,0.9)" }}
      >
        {(["chat", "learn"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 text-sm font-medium capitalize transition-all duration-200"
            style={{ color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)", borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 65px)" }}>

        {/* Chat */}
        <div
          className={`flex flex-col flex-1 ${activeTab !== "chat" ? "hidden md:flex" : "flex"}`}
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {searchQuery.trim() && filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--muted-foreground)" }}>
                <SearchIcon />
                <p className="text-sm">No messages match <strong style={{ color: "var(--foreground)" }}>"{searchQuery}"</strong></p>
              </div>
            ) : (
              displayedMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onReact={handleReact} searchQuery={searchQuery} />
              ))
            )}
            {isTyping && (
              <div className="message-appear flex items-center mb-5">
                <div className="ai-glow w-8 h-8 rounded-full flex items-center justify-center mr-2.5 shrink-0 text-xs font-mono font-bold" style={{ background: "linear-gradient(135deg,#ff5f57,#ff9a3c)", color: "#fff" }}>
                  AI
                </div>
                <div className="rounded-2xl rounded-tl-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Follow-up suggestions */}
          {!isTyping && followUpSuggestions.length > 0 && !searchQuery && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <p className="px-4 pt-2 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>SUGGESTED FOLLOW-UPS</p>
              <FollowUpChips suggestions={followUpSuggestions} onSelect={(q) => { setFollowUpSuggestions([]); sendMessage(q); }} />
            </div>
          )}

          {/* Starter chips */}
          {messages.length <= 1 && !searchQuery && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {starterQuestions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="chip-hover shrink-0 text-xs px-3.5 py-2 rounded-xl"
                  style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1.5px solid var(--border)", whiteSpace: "nowrap", animation: `fadeSlideIn 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s forwards`, opacity: 0 }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="px-4 pb-4 pt-3 border-t"
            style={{ borderColor: "var(--border)", background: isDark ? "rgba(14,14,18,0.85)" : "rgba(253,252,248,0.88)", backdropFilter: "blur(10px)" }}
          >
            <div
              className="flex gap-2 items-end rounded-2xl px-4 py-3 transition-all duration-200"
              style={{ background: "var(--secondary)", border: "1.5px solid var(--border)" }}
              onFocusCapture={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--primary)"; el.style.boxShadow = "0 0 0 3px var(--shadow-glow)"; }}
              onBlurCapture={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "none"; }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCharCount(e.target.value.length);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="Ask about prompts, memory, or chatbot design…"
                disabled={isTyping}
                maxLength={500}
                className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
                style={{ color: "var(--foreground)", caretColor: "var(--primary)", maxHeight: "120px", fontFamily: "inherit" }}
              />
              <div className="flex flex-col items-end gap-1.5">
                {charCount > 0 && (
                  <span className="text-xs font-mono" style={{ color: charCount > 450 ? "#ff5f57" : "var(--muted-foreground)" }}>
                    {charCount}/500
                  </span>
                )}
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${input.trim() && !isTyping ? "send-btn-active" : ""}`}
                  style={{ background: input.trim() && !isTyping ? undefined : "var(--muted)", color: input.trim() && !isTyping ? "#fff" : "var(--muted-foreground)", cursor: input.trim() && !isTyping ? "pointer" : "default" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline
            </p>
          </div>
        </div>

        {/* Learn panel */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 overflow-y-auto panel-appear ${activeTab !== "learn" ? "hidden md:block" : "block"}`}
          style={{ background: isDark ? "rgba(14,14,18,0.72)" : "rgba(253,252,248,0.8)", backdropFilter: "blur(10px)" }}
        >
          <div className="p-5">
            <h2 className="font-serif text-2xl mb-0.5 gradient-text">Learn</h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Core concepts behind AI assistants</p>

            <div className="flex flex-col gap-2">
              {concepts.map((c) => (
                <div key={c.id}>
                  <ConceptCard concept={c} active={activeConcept === c.id} onClick={() => setActiveConcept(activeConcept === c.id ? null : c.id)} />
                  {activeConcept === c.id && <ConceptDetail concept={c} />}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 rounded-2xl p-4 card-lift" style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}>
              <div className="text-xs font-mono tracking-widest mb-3 gradient-text font-medium">SESSION STATS</div>
              <div className="space-y-2.5">
                {[
                  { label: "Total messages", value: messages.length },
                  { label: "Your messages", value: messages.filter((m) => m.role === "user").length },
                  { label: "AI responses", value: messages.filter((m) => m.role === "assistant").length },
                  { label: "Thumbs up", value: messages.filter((m) => m.reaction === "up").length },
                  { label: "Est. tokens", value: `~${Math.round(messages.reduce((a, m) => a + m.content.length, 0) / 4).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                    <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>{value}</span>
                  </div>
                ))}
                <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="progress-bar h-full rounded-full" style={{ width: `${Math.min((messages.length / 50) * 100, 100)}%` }} />
                </div>
                <p className="text-xs pt-0.5" style={{ color: "var(--muted-foreground)" }}>Context resets when you clear</p>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 rounded-2xl p-4 card-lift" style={{ background: "var(--muted)", border: "1.5px solid var(--border)" }}>
              <div className="text-xs font-mono tracking-widest mb-3 gradient-text font-medium">QUICK TIPS</div>
              <ul className="space-y-2.5">
                {[
                  { text: "Be specific in your questions", color: "#ff5f57" },
                  { text: "Hover messages to copy or react", color: "#22d3ee" },
                  { text: "Use follow-up chips to go deeper", color: "#b8ff3f" },
                  { text: "Search your chat history with 🔍", color: "#ff9a3c" },
                  { text: "Export the chat as a .txt file", color: "#ff5f57" },
                ].map(({ text, color }) => (
                  <li key={text} className="flex gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span style={{ color }}>→</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
