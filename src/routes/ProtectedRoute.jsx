import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({children}) => {

    const {isAuthenticated, isLoading, } = useAuth()

    if(isLoading){
        return <LoadingSpinner />
    }

    console.log("isAuthenticated in ProtectedRoute: ", isAuthenticated);
    if(!isAuthenticated){
        return <Navigate to="/" replace />
    }

    return children;
}

export default ProtectedRoute;