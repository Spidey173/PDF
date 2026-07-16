"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  FileText,
  ShieldCheck,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAppStore, type ChatMessage } from "@/lib/store";
import { streamQuery, type CitationInfo } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { KonohaSwirl, ShurikenIcon } from "@/app/page";

// ──────────────────────────────────────
// Chat Panel (main export)
// ──────────────────────────────────────

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessionId,
    messages,
    isQuerying,
    insights,
    addMessage,
    appendToMessage,
    updateMessage,
    setQuerying,
    setCurrentStreamingId,
    highlightCitation,
  } = useAppStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || !sessionId || isQuerying) return;

    const question = input.trim();
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      role: "user",
      content: question,
      timestamp: new Date(),
    });

    // Add placeholder AI message
    const aiMsgId = `ai-${Date.now()}`;
    addMessage({
      id: aiMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    });

    setQuerying(true);
    setCurrentStreamingId(aiMsgId);

    try {
      // Build history from previous messages
      const history = messages
        .filter((m) => !m.isStreaming)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const citations: CitationInfo[] = [];
      let confidence = 0;

      for await (const event of streamQuery(sessionId, question, history)) {
        switch (event.event) {
          case "token":
            appendToMessage(aiMsgId, event.data.text as string);
            break;
          case "citation":
            citations.push(event.data as unknown as CitationInfo);
            break;
          case "confidence":
            confidence = event.data.score as number;
            break;
          case "done":
            updateMessage(aiMsgId, {
              isStreaming: false,
              citations,
              confidence_score: confidence,
            });
            break;
          case "error":
            updateMessage(aiMsgId, {
              content:
                "Sorry, a chakra disruption occurred while deciphering the response. Please try again.",
              isStreaming: false,
            });
            break;
        }
      }
    } catch (err) {
      updateMessage(aiMsgId, {
        content: `Error: ${err instanceof Error ? err.message : "Failed to channel response"}`,
        isStreaming: false,
      });
    } finally {
      setQuerying(false);
      setCurrentStreamingId(null);
    }
  }, [
    input,
    sessionId,
    isQuerying,
    messages,
    addMessage,
    appendToMessage,
    updateMessage,
    setQuerying,
    setCurrentStreamingId,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 ? (
          <EmptyState
            suggestedQuestions={insights?.suggested_questions || []}
            onQuestionClick={handleSuggestedQuestion}
          />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCitationClick={highlightCitation}
                animationDelay={idx * 0.02}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested follow-ups */}
      {messages.length > 0 && !isQuerying && (
        <SuggestedFollowups
          messages={messages}
          onClick={handleSuggestedQuestion}
        />
      )}

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#10121a]/60">
        <div className="flex items-end gap-2 p-2 rounded-xl border border-white/5 bg-surface-secondary/80 focus-within:border-accent-primary/45 transition-colors relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Inquire about scroll secrets..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none py-2 px-3 max-h-[120px] pr-10"
            rows={1}
            disabled={isQuerying}
            id="chat-input"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isQuerying}
            className={`
              p-2.5 rounded-lg transition-all duration-300 cursor-pointer group flex items-center justify-center shrink-0
              ${
                input.trim() && !isQuerying
                  ? "bg-accent-primary text-midnight-950 hover:bg-accent-secondary shadow shadow-accent-primary/20"
                  : "bg-white/5 text-text-muted cursor-not-allowed"
              }
            `}
            id="send-button"
            title="Channel Jutsu"
          >
            {isQuerying ? (
              <ShurikenIcon className="w-4 h-4 animate-shuriken-fast text-midnight-950" />
            ) : (
              <ShurikenIcon className="w-4 h-4 text-midnight-950 group-hover:rotate-90 transition-transform duration-300" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-text-muted text-center mt-2.5 opacity-60">
          Chakra deciphers can be volatile. Double check crucial info with the source scroll.
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Message Bubble
// ──────────────────────────────────────

function MessageBubble({
  message,
  onCitationClick,
  animationDelay = 0,
}: {
  message: ChatMessage;
  onCitationClick: (citation: CitationInfo | null) => void;
  animationDelay?: number;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full border border-accent-primary/30 bg-surface-secondary flex items-center justify-center mt-1 shadow shadow-accent-primary/5 animate-chakra">
          <KonohaSwirl className="w-4.5 h-4.5 text-accent-primary" />
        </div>
      )}

      <div
        className={`
          max-w-[85%] rounded-2xl relative
          ${
            isUser
              ? "bg-gradient-to-br from-surface-secondary to-surface-elevated border border-white/5 text-text-primary rounded-tr-none px-4 py-3 shadow"
              : "parchment-scroll rounded-tl-none px-5 py-4 text-[#2b1f15]"
          }
        `}
      >
        {isUser && (
          <div className="absolute right-0 top-0 translate-x-[4px] -translate-y-[4px]">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
          </div>
        )}

        {isUser ? (
          <p className="text-sm leading-relaxed text-text-primary font-medium">{message.content}</p>
        ) : (
          <>
            {message.content ? (
              <div className="text-sm markdown-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : message.isStreaming ? (
              <div className="flex items-center gap-2 py-1">
                <div className="w-4.5 h-4.5 text-accent-primary animate-shuriken-fast shrink-0">
                  <KonohaSwirl className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs text-[#5c4636] font-bold">Gathering Chakra & Deciphering...</span>
              </div>
            ) : null}

            {/* Streaming cursor */}
            {message.isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 bg-accent-primary animate-pulse ml-1 align-middle" />
            )}

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-[#dfcfb2]">
                {message.citations.map((citation, idx) => (
                  <button
                    key={citation.citation_id || idx}
                    onClick={() => onCitationClick(citation)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded
                      bg-[#ff6b00]/10 hover:bg-[#ff6b00]/20 border border-[#ff6b00]/25
                      text-[#8b4f1d] hover:text-[#ff6b00] text-xs font-bold cursor-pointer
                      transition-all duration-200 hover:scale-105"
                    title={`Consult Scroll Page ${citation.page}`}
                  >
                    <FileText className="w-3 h-3 text-[#ff6b00]" />
                    Page {citation.page}
                  </button>
                ))}
              </div>
            )}

            {/* Confidence Score (Chakra Grounding Meter) */}
            {message.confidence_score != null &&
              message.confidence_score > 0 &&
              !message.isStreaming && (
                <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-[#dfcfb2]">
                  <ShieldCheck
                    className={`w-4 h-4 shrink-0 ${
                      message.confidence_score >= 0.8
                        ? "text-[#234b36]"
                        : message.confidence_score >= 0.5
                          ? "text-[#ff6b00]"
                          : "text-[#c62828]"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="confidence-meter bg-black/10">
                      <div
                        className={`confidence-fill ${
                          message.confidence_score >= 0.8
                            ? "bg-[#234b36]"
                            : message.confidence_score >= 0.5
                              ? "bg-[#ff6b00]"
                              : "bg-[#c62828]"
                        }`}
                        style={{
                          width: `${message.confidence_score * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#5c4636] font-bold font-mono shrink-0">
                    {Math.round(message.confidence_score * 100)}% chakra grounded
                  </span>
                </div>
              )}
          </>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full border border-white/10 bg-surface-secondary flex items-center justify-center mt-1 shadow">
          <User className="w-4 h-4 text-text-secondary" />
        </div>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────
// Empty State
// ──────────────────────────────────────

function EmptyState({
  suggestedQuestions,
  onQuestionClick,
}: {
  suggestedQuestions: string[];
  onQuestionClick: (q: string) => void;
}) {
  const displayQuestions = suggestedQuestions.slice(0, 5);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-14 h-14 rounded-full border border-accent-primary/20 bg-[#ff6b00]/5 flex items-center justify-center mx-auto mb-4 animate-chakra shadow-sm">
          <KonohaSwirl className="w-7 h-7 text-accent-primary" />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1 uppercase tracking-wider font-ninja">
          Leaf Archives Consultation
        </h3>
        <p className="text-xs text-text-muted mb-8 leading-relaxed">
          Inquire about the contents of your sealed scrolls. The deciphering engine will retrieve records grounded in truths.
        </p>
      </motion.div>

      {displayQuestions.length > 0 && (
        <div className="w-full space-y-2.5">
          <p className="text-[9px] text-accent-primary font-bold uppercase tracking-widest mb-3 text-center">
            Strategic Inquiries
          </p>
          {displayQuestions.map((q, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => onQuestionClick(q)}
              className="w-full text-left p-3.5 rounded-xl border border-white/5 bg-surface-secondary/70 hover:border-accent-primary/20 hover:bg-surface-secondary
                text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer
                transition-all duration-200 group flex items-center gap-3 relative overflow-hidden"
            >
              <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent-primary/10 transition-colors">
                <ShurikenIcon className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-colors group-hover:rotate-45 duration-300" />
              </div>
              <span className="line-clamp-2 pr-4">{q}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// Suggested Follow-ups
// ──────────────────────────────────────

function SuggestedFollowups({
  messages,
  onClick,
}: {
  messages: ChatMessage[];
  onClick: (q: string) => void;
}) {
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && !m.isStreaming);

  // Simple follow-up suggestions based on context
  const suggestions = [
    "Elaborate on the details.",
    "Show key takeaways.",
    "Identify critical risks.",
  ];

  if (!lastAssistant || lastAssistant.content.length < 50) return null;

  return (
    <div className="px-5 py-2.5 flex gap-2 overflow-x-auto bg-[#10121a]/30">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onClick(s)}
          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold text-text-secondary cursor-pointer
            border border-white/8 hover:border-accent-primary/30 hover:text-accent-primary
            hover:bg-accent-primary/5 transition-all duration-200"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

