import { useEffect, useRef, useState, useCallback } from "react";
import CryptoDetail from "../components/CryptoDetail";
import { useParams } from "react-router-dom";
import CryptoChart from "../components/CryptoChart";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { captureWebSocketError } from "../utils/sentryUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertSection from "../components/AlertSection"
import { Client } from "@stomp/stompjs";


const CryptoPage = () => {

    const { id } = useParams();
    const { isAuthenticated, getAccessToken } = useAuth();
    const [isConnected, setIsConnected] = useState(false)
    const [cryptoData, setCryptoData] = useState({});
    const [loading, setLoading] = useState(false);
    const clientRef = useRef(null);
    const subscriptionRef = useRef([]);
    const currentSymbolRef = useRef(null);

    const subscribeToSymbol = useCallback((symbol) => {
        if (!clientRef.current?.connected) return;

        // unsubscribe from previous symbol first (server keeps a set per user)
        if (currentSymbolRef.current && currentSymbolRef.current !== symbol) {
            clientRef.current.publish({
                destination: "/app/crypto/detail/unsubscribe",
                body: JSON.stringify({ symbol: currentSymbolRef.current }),
            });
        }

        console.log("subscribing to symbol:", symbol);
        clientRef.current.publish({
            destination: "/app/crypto/detail/subscribe",
            body: JSON.stringify({ symbol }),
        });

        currentSymbolRef.current = symbol;
    }, []);

    useEffect(() => {
        if (!id || !isAuthenticated) {
            setIsConnected(false);
            clientRef.current?.deactivate();
            clientRef.current = null;
            return;
        }

        let client;

        const connect = async () => {
            setLoading(true);

            let token;
            try {
                token = await getAccessToken();
            } catch (error) {
                console.error("Failed to get access token:", error);
                captureWebSocketError(error, { eventType: "AUTH_TOKEN_FETCH" }, null, false);
                setLoading(false);
                return;
            }

            client = new Client({
                brokerURL: `${import.meta.env.VITE_WS_URL}/crypto-detail`,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,
                debug: (str) => {
        console.log("[STOMP]", str);
    },
            });

            client.onConnect = () => {
                console.log("STOMP connection established (detail)");
                setIsConnected(true);
                    
                const detailSub = client.subscribe("/user/queue/crypto/detail", (msg) => {
                    const detail = JSON.parse(msg.body);
                    console.log("Received crypto detail data:", detail);
                    setCryptoData(detail);
                    setLoading(false);
                });

                const errorSub = client.subscribe("/user/queue/errors", (msg) => {
                    const { message } = JSON.parse(msg.body);
                    console.error("Received error message:", message);
                    captureWebSocketError(new Error(message), { eventType: "SERVER_ERROR" }, client, true);
                });

                subscriptionRef.current = [detailSub, errorSub];

                subscribeToSymbol(id);
            };

            client.onDisconnect = () => {
                console.log("STOMP connection closed (detail)");
                setIsConnected(false);
            };

            client.onStompError = (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
                captureWebSocketError(new Error(frame.headers["message"]), { eventType: "WS_ERROR" }, client, isConnected);
            };

            client.onWebSocketError = (error) => {
                console.error("WebSocket error:", error);
                captureWebSocketError(error, { eventType: "WS_ERROR" }, client, isConnected);
            };

            clientRef.current = client;
            client.activate();
        };

        connect();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clientRef.current?.deactivate();
            } else if (!clientRef.current?.connected) {
                connect();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            subscriptionRef.current.forEach((sub) => sub.unsubscribe());
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clientRef.current?.deactivate();
            clientRef.current = null;
        };
    }, [id, isAuthenticated, getAccessToken, subscribeToSymbol]);

    
    useEffect(() => {
        if (clientRef.current?.connected && id) {
            subscribeToSymbol(id);
        }
    }, [id, subscribeToSymbol]);

    const [isAlertExpanded, setIsAlertExpanded] = useState(true);

    if (loading) return <LoadingSpinner />

    return (
        <Layout>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Fixed width */}
                {cryptoData && Object.keys(cryptoData).length > 0 && (
                    <>
                        <div className="w-1/4 border-r-2 border-gray-700 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <CryptoDetail cryptoData={cryptoData} />

                        </div>

                        {/* Main content - Takes remaining space */}
                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Chart: fills available space */}
                            <div className="flex-1 overflow-hidden">
                                <CryptoChart id={id} />
                            </div>

                            {/* Alerts: fixed height when expanded, minimal when collapsed */}
                            <div
                                className={`transition-all duration-300 flex-shrink-0 ${isAlertExpanded ? "h-[48vh] min-h-[320px] max-h-[550px]" : "h-[60px]"
                                    }`}
                            >
                                <AlertSection
                                    isExpanded={isAlertExpanded}
                                    setIsExpanded={setIsAlertExpanded}
                                    cryptoData={cryptoData}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default CryptoPage;