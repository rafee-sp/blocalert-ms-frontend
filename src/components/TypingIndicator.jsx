const TypingIndicator = () => {

    return (
        <div className="flex items-start gap-2">
            <img 
                src="/blockalert-icon.png"
                alt="BlocAlert" 
                className="mt-1 h-7 w-7 shrink-0 rounded-lg object-cover" 
            />
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <span className="assistant-dot" />
                <span className="assistant-dot [animation-delay:150ms]" />
                <span className="assistant-dot [animation-delay:300ms]" />
            </div>
        </div>
    );

}

export default TypingIndicator;