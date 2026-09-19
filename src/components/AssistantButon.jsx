import { FiMessageCircle, FiX } from "react-icons/fi";
import { useAssistant } from "../context/AssistantContext";

const AssistantButton = () => {

    const { isOpen, toggleAssistant } = useAssistant();

    return (
        <button
            type="button"
            onClick={toggleAssistant}
            aria-label={
                isOpen ? "Close AI assistant" : "Open AI assistant"
            }
            className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all
                       duration-200 hover:scale-105 hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 sm:bottom-6 sm:right-6"
        >
            {isOpen ? (
                <FiX className="h-6 w-6" />
            ) : (
                <FiMessageCircle className="h-6 w-6" />
            )}
        </button>
    );
}

export default AssistantButton;