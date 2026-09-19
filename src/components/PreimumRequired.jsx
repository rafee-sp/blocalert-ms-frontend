import { FiStar } from "react-icons/fi";

const PremiumRequired = ({ onUpgrade }) => {

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
               <FiStar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium feature</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
                BlocAlert AI is available exclusively to Premium users. Upgrade your plan to unlock the assistant.
            </p>
            <button 
                type="button" 
                onClick={onUpgrade} 
                className="mt-6 w-full max-w-xs rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition
                 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
                Upgrade to Premium
            </button>
        </div>);
}

export default PremiumRequired;