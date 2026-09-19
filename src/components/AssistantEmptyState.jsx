import { FiArrowRight, FiBarChart2, FiBell, FiStar, FiTrendingUp } from "react-icons/fi";

const AssistantEmptyState = () => {

    return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <FiStar className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">How can I help?</h3>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray-500 dark:text-gray-400">
                Ask about prices, trends or top movers  or create a price alert for a cryptocurrency.
            </p>
            <div className="mt-6 w-full max-w-xs space-y-2">
                <Suggestion
                    icon={<FiBarChart2 />}
                    text="How has Bitcoin done this month?"
                />
                <Suggestion
                    icon={<FiTrendingUp />}
                    text="What are today's top gainers?"
                />
                <Suggestion
                    icon={<FiBell />}
                    text="Alert me when ETH drops below 2k via email"
                />
            </div>
        </div>
    );

}

const Suggestion = ({ icon, text }) => {

    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <span className="text-indigo-500">{icon}</span>
            <span className="flex-1">{text}</span>
            <FiArrowRight className="h-4 w-4 text-gray-400" />
        </div>
    );

}

export default AssistantEmptyState;