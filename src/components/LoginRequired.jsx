const LoginRequired = ({login}) => {

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <img 
                src="/blockalert-icon.png"
                alt="BlocAlert" 
                className="mb-5 h-16 w-16 rounded-2xl object-cover shadow-md shadow-gray-900/10"
             />
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Meet BlocAlert AI
            </h3>
             <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Get personalized insights about your cryptocurrencies, alerts, and BlocAlert account.
             </p>
             <button 
                type="button"
                onClick={login}
                className="mt-6 w-full max-w-xs rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                    Log in to continue
            </button>
        </div>
    )

}

export default LoginRequired;