import { useState } from "react"
import authApi from "../api/authApi";
import { AssistantContext } from "./AssistantContext";

export const AssistantProvider = ({ children }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleAssistant = () => {
        setIsOpen((prev) => !prev);
    }

    const openAssistant = () => {
        setIsOpen(true);
    };

    const closeAssistant = () => {
        setIsOpen(false);
    }

    const sendMessage = async (message) => {

        const trimmedMessage = message.trim();

        console.log("sendMessage called with message: ", trimmedMessage);

        if (!trimmedMessage || isLoading) {
            return;
        }

        console.log("sendMessage called with trimmedMessage: ", trimmedMessage);

        setMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: "user",
                content: trimmedMessage,
            }
        ])

        setIsLoading(true);

        try {
            const res = await authApi.post("/assistant/chat", { message: trimmedMessage });

            console.log("response:", res);
            console.log("status:", res.status);
            console.log("data:", res.data);

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: res.data.response,
                },
            ]);


        } catch (error) {

            console.error("Assistant error:", error);

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        type: "access-denied",
                        content:
                            "BlocAlert AI is available only to Premium users.",
                    },
                ]);

                return;
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content:
                        "Sorry, I couldn't process your request right now. Please try again.",
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const clearConversation = () => {

        if (isLoading) {
            return;
        }

        setMessages([]);
    }

    return (
        <AssistantContext.Provider
            value={{
                isOpen,
                messages,
                isLoading,
                toggleAssistant,
                openAssistant,
                closeAssistant,
                sendMessage,
                clearConversation
            }}
        >
            {children}
        </AssistantContext.Provider>
    )
}