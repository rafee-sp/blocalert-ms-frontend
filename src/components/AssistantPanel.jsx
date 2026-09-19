import { useAuth } from "../context/AuthContext";
import { Roles } from "../utils/roles";
import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiX } from "react-icons/fi";
import LoginRequired from "./LoginRequired";
import PremiumRequired from "./PreimumRequired";
import PremiumChat from "./PremiumChat";
import PricingModal from "./PricingModal";
import { useAssistant } from "../context/AssistantContext";

const AssistantPanel = () => {

    const {
        messages,
        isLoading,
        sendMessage,
        clearConversation,
        closeAssistant,
    } = useAssistant();

    const { user, login, isAuthenticated } = useAuth();

    const isPremium = isAuthenticated && user?.role === Roles.PREMIUM_USER;

    const [input, setInput] = useState("");
    const [isPricingModalOpen, setPricingModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, isLoading]);

    const handleSend = async () => {
        console.log("handleSend called with input: ", input);
        if (!isPremium || !input.trim() || isLoading) {
            return;
        }

        const message = input;
        console.log("handleSend called with message: ", message);

        setInput("");

        await sendMessage(message);

        textareaRef.current?.focus();
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-[9998]  flex h-[min(680px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200
                       bg-white shadow-2xl shadow-gray-900/10 animate-[assistantOpen_0.2s_ease-out] dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 sm:right-6"
            >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <img
                        src="/blockalert-icon.png"
                        alt="BlocAlert"
                        className="h-9 w-9 rounded-xl object-cover"
                    />

                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                            BlocAlert AI
                        </h2>

                        <div className="flex items-center gap-1.5">
                            <span className=" h-1.5 w-1.5 rounded-full bg-emerald-500 "/>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isPremium
                                    ? "Premium AI assistant"
                                    : "Premium feature"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {isPremium && (
                        <button
                            type="button"
                            onClick={clearConversation}
                            disabled={
                                messages.length === 0 ||
                                isLoading
                            }
                            title="Clear conversation"
                            className="rounded-lg p-2text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                            <FiTrash2 className="h-4 w-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={closeAssistant}
                        aria-label="Close assistant"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Access control */}
            {!isAuthenticated ? (
                <LoginRequired login={login} />
            ) : !isPremium ? (
                <PremiumRequired
                    onUpgrade={() => setPricingModalOpen(true)}
                />
            ) : (
                <PremiumChat
                    messages={messages}
                    isLoading={isLoading}
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    handleKeyDown={handleKeyDown}
                    textareaRef={textareaRef}
                    messagesEndRef={messagesEndRef}
                />
            )}
            {
                isPricingModalOpen &&
                <PricingModal onClose={() => setPricingModalOpen(!isPricingModalOpen)} />
            }
        </div>
    );
}
export default AssistantPanel;