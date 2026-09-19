import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { AlertWebsocketContext } from "./AlertWebsocketContext";
import { toast } from "react-toastify";
import AlertToast from "../components/AlertToast";
import { captureWebSocketError } from "../utils/sentryUtils";
import { Client } from "@stomp/stompjs";

export const AlertWebsocketProvider = ({ children }) => {

    const { isAuthenticated, getAccessToken } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const audioRef = useRef(null);
    const MAX_RETRY = 3;
    const clientRef = useRef(null);
    const subscriptionRef = useRef([]);

    const toastOptions = useMemo(() => ({
        autoClose: 10000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
    }), []);

    useEffect(() => {
        audioRef.current = new Audio("/alert-notification.wav");
        audioRef.current.volume = 0.8;
    }, []);

    const playAlertSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    }, []);

    const handleAlertsMessage = useCallback((msg) => {
        try {
            playAlertSound();

            const alertData = msg.alertData ?? msg; 

            if (Array.isArray(alertData)) {
                alertData.forEach((alert) => {
                    toast(<AlertToast alert={alert} />, toastOptions);
                });
            } else {
                toast(<AlertToast alert={alertData} />, toastOptions);
            }
        } catch (err) {
            captureWebSocketError(err, { eventType: "ALERTS_TOAST", messageData: msg }, clientRef.current, isConnected);
        }
    }, [toastOptions, playAlertSound]);

    useEffect(() => {

        if (!isAuthenticated) {
            setIsConnected(false);
            clientRef.current?.deactivate();
            clientRef.current = null;
            return;
        }

        let cancelled = false;
        let client;

        const connect = async () => {
            let token;
            try {
                token = await getAccessToken();
            } catch (error) {
                console.error("Failed to get access token for Alert websocket auth:", error);
                captureWebSocketError(error, { eventType: "AUTH_REQUEST" }, null, false);
                return;
            }

            if (cancelled) return; 

            client = new Client({                
                brokerURL: `${import.meta.env.VITE_WS_URL}/alerts`,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,
            });

            client.onConnect = () => {
                console.log("STOMP alert connection established");
                setIsConnected(true);

                const alertsSub = client.subscribe("/user/queue/alerts", (msg) => {
                    const alertData = JSON.parse(msg.body);
                    handleAlertsMessage({ alertData });
                });

                const errorSub = client.subscribe("/user/queue/errors", (msg) => {
                    const { message } = JSON.parse(msg.body);
                    console.error("Received error message:", message);
                    captureWebSocketError(new Error(message), { eventType: "SERVER_ERROR" }, client, true);
                });

                subscriptionRef.current = [alertsSub, errorSub];
            };

            client.onDisconnect = () => {
                console.log("STOMP alert connection closed");
                setIsConnected(false);
            };

            client.onStompError = (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
                setIsConnected(false);
                captureWebSocketError(new Error(frame.headers["message"]), { eventType: "WS_ALERT_ERROR" }, client, isConnected);
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
            cancelled = true;
            subscriptionRef.current.forEach((sub) => sub.unsubscribe());
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clientRef.current?.deactivate();
            clientRef.current = null;
        };

    }, [isAuthenticated, getAccessToken, handleAlertsMessage]);
       

    return (
        <AlertWebsocketContext.Provider value={{ isConnected }}>
            {children}
        </AlertWebsocketContext.Provider>
    )
}