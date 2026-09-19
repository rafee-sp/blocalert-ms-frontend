import { FiSend } from "react-icons/fi";
import AssistantEmptyState from "./AssistantEmptyState";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const PremiumChat = ({
    messages,
    isLoading,
    input,
    setInput,
    handleSend,
    handleKeyDown,
    textareaRef,
    messagesEndRef
}) => {

    return (
        <>
            <div className="flex-1 overflow-y-auto px-4 py-5">
                {messages.length === 0 ?
                    <AssistantEmptyState /> :
                    <div className="space-y-5">
                        {messages.map((message) => (<ChatMessage key={message.id} message={message} />))
                        }
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>}
            </div>
            <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-end gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 transition focus-within:border-indigo-500 
                                    focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        rows={1}
                        placeholder="Ask BlocAlert AI..."
                        className="max-h-32 min-h-[24px] flex-1 resize-none border-0 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 
                                            disabled:opacity-50 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:pointer-events-none
                                        disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <FiSend className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-gray-400">Enter to send · Shift + Enter for new line</p>
            </div>
        </>
    );
}

export default PremiumChat;