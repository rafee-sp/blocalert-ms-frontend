import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage = ({ message }) => {

    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "items-start justify-start gap-2"}`}>
            {!isUser &&
                <img
                    src="/blockalert-icon.png"
                    alt="BlocAlert"
                    className="mt-1 h-7 w-7 shrink-0 rounded-lg object-cover"
                />}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6
                             ${isUser ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
            >
                {isUser ?
                    <p className="whitespace-pre-wrap">{message.content}</p> :
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                }
            </div>
        </div>);

}

export default ChatMessage;