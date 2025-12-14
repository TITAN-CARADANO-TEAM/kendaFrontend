"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Bot, Sparkles, User, ChevronRight, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
}

const DEFAULT_QUESTIONS = [
    "C'est quoi Cardano ?",
    "Comment commander une course ?",
    "Comment devenir chauffeur ?",
    "L'application est-elle sécurisée ?"
];

export function ChatWidget({ isOpen: externalIsOpen, onToggle }: { isOpen?: boolean; onToggle?: () => void }) {
    // Internal state if not controlled appropriately, but we'll prioritize props if provided
    const [isOpenInternal, setIsOpenInternal] = useState(false);
    const isOpen = externalIsOpen ?? isOpenInternal;
    const toggle = onToggle ?? (() => setIsOpenInternal(prev => !prev));

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            content: "Bonjour ! Je suis l'assistant IA de Kenda. Je parle plusieurs langues. 🤖\n\nJe suis là pour vous aider à utiliser l'application et comprendre la blockchain Cardano. Posez-moi une question ou choisissez-en une ci-dessous !"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Expose a global event listener for opening chat from anywhere
    useEffect(() => {
        const handleOpenChat = () => {
            if (!isOpen) {
                if (onToggle) onToggle();
                else setIsOpenInternal(true);
            }
        };
        window.addEventListener('open-kenda-chat', handleOpenChat);
        return () => window.removeEventListener('open-kenda-chat', handleOpenChat);
    }, [isOpen, onToggle]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch');
            }

            const data = await response.json();
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: data.content };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error(error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: `Erreur: ${error.message || "Problème de connexion"}` };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                content: "Bonjour ! Je suis l'assistant IA de Kenda. Je parle plusieurs langues.  🤖\n\nJe suis là pour vous aider à utiliser l'application et comprendre la blockchain Cardano. Posez-moi une question ou choisissez-en une ci-dessous !"
            }
        ]);
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={toggle}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#F0B90B] text-black shadow-[0_0_20px_rgba(240,185,11,0.4)] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                    >
                        <Bot className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#1a1a1a]"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-[#0f0f0f] border border-[#333] rounded-[2rem] shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-[#141414] border-b border-[#222]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#b88c00] flex items-center justify-center shadow-lg">
                                    <Bot className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Kenda Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-[#999]">En ligne</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearHistory}
                                    className="text-[#666] hover:text-red-500 hover:bg-white/5 rounded-full"
                                    title="Effacer la conversation"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={toggle} className="text-[#666] hover:text-white hover:bg-white/5 rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                            {messages.map((msg, index) => (
                                <React.Fragment key={msg.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                                            msg.role === 'user' ? "bg-[#333] text-white" : "bg-[#F0B90B] text-black"
                                        )}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-[#333] text-white rounded-tr-sm"
                                                : "bg-[#1a1a1a] text-[#e0e0e0] border border-[#333] rounded-tl-sm"
                                        )}>
                                            <div className="prose prose-invert prose-sm max-w-none break-words">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-bold text-[#F0B90B]" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-[#F0B90B] underline hover:no-underline" {...props} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Render Default Questions after the first message (Welcome) and ONLY if it's the welcome message or they haven't been dismissed (optional logic) */}
                                    {/* User requested: response below questions. So questions must stay. */}
                                    {index === 0 && (
                                        <div className="ml-11 mt-2 mb-4 flex flex-col gap-2 max-w-[85%]">
                                            {DEFAULT_QUESTIONS.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(q)}
                                                    className="whitespace-normal text-left px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#333] text-sm text-[#ccc] hover:bg-[#333] hover:text-white hover:border-[#F0B90B] transition-all"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-[#F0B90B] text-black flex-shrink-0 flex items-center justify-center mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center">
                                        <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-[#666] rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                            {/* Questions moved inside mapping */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#141414] border-t border-[#222]">
                            <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#333] rounded-full p-1 pl-4 focus-within:border-[#F0B90B]/50 transition-colors">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-[#555]"
                                />
                                <Button
                                    size="icon"
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-full bg-[#F0B90B] text-black hover:bg-[#d4a000] h-9 w-9"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-[10px] text-center text-[#444] mt-2">
                                L'IA peut faire des erreurs. Vérifiez les informations importantes.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
