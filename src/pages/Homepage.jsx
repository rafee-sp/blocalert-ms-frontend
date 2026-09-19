import { useEffect, useRef, useState } from "react";
import CryptoTable from "../components/CryptoTable";
import StatsBar from "../components/StatsBar";
import Pagination from "../components/Pagination";
import CryptoSearch from "../components/CryptoSearch";
import Layout from "./Layout";
import { captureWebSocketError } from "../utils/sentryUtils";
import { Client } from "@stomp/stompjs";

const HomePage = () => {

    const [marketData, setMarketData] = useState(null);
    const [cryptoData, setCryptoData] = useState([]);
    const [pageable, setPageable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    const clientRef = useRef(null);
    const subscriptionRef = useRef([]);
    const DEFAULT_PAGE_NO = 1;
    const DEFAULT_PAGE_SIZE = 10; //change to dynamic
    
    useEffect(() => {

        const client = new Client({
            brokerURL: `${import.meta.env.VITE_WS_URL}/home`,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        client.onConnect = () => {
            console.log("STOMP connection established");
            setIsConnected(true);

            const pageSubscription = client.subscribe("/user/queue/crypto/page", (msg) => {
                const cryptoResponse = JSON.parse(msg.body);
                console.log("Received crypto data:", cryptoResponse);
                setCryptoData(cryptoResponse.cryptoList);
                setPageable(cryptoResponse.pagination);
                setLoading(false);
            });

            const marketSubscription = client.subscribe("/topic/market-data", (msg) => {
                const marktetResponse = JSON.parse(msg.body);
                console.log("Received market data:", marktetResponse);
                setMarketData(marktetResponse);
            });

            const errorSubscription = client.subscribe("/user/queue/errors", (msg) => {
                const { message } = JSON.parse(msg.body);
                console.error("Received error message:", message);
                captureWebSocketError(new Error(message), { eventType: "SERVER_ERROR" }, client, true);
            });

            subscriptionRef.current = [pageSubscription, marketSubscription, errorSubscription];

            subscribePage(DEFAULT_PAGE_NO, DEFAULT_PAGE_SIZE);
            subscribeMarketData();
        }

        client.onDisconnect = () => {
            console.log("STOMP connection closed");
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

        const handleVisisbilityChange = () => {
            if (document.hidden) {
                client.deactivate();
            } else if (!client.connected) {
                client.activate();
            }
        };

        document.addEventListener("visibilitychange", handleVisisbilityChange);

        return () => {
            subscriptionRef.current.forEach((sub) => sub.unsubscribe());
            document.removeEventListener("visibilitychange", handleVisisbilityChange);
            client.deactivate();
            clientRef.current = null;
        };

    }, []);

    const subscribePage = (page, size) => {

        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/crypto/page/subscribe",
                body: JSON.stringify({ page, size }),
            });
        }
    };

    const subscribeMarketData = () => {

        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination: "/app/market-data/subscribe",
                body: JSON.stringify({}),
            });
        }
    }

    const handlePagination = (page = 1) => {
        subscribePage(page, DEFAULT_PAGE_SIZE)
    }

    return (
        <Layout>
            <div className="flex flex-col flex-1 min-h-0">

                <div className="flex-none md:pb-6">
                    <StatsBar marketData={marketData} loading={loading} />
                </div>

                <div className="flex-none mb-2">
                    <CryptoSearch />
                </div>

                <div className="flex-1 overflow-auto min-h-0">
                    <CryptoTable data={cryptoData} loading={loading} />
                </div>

                {pageable?.page && (
                    <div className="flex-none pb-4 md:pb-6">
                        <Pagination
                            onPageChange={(page) => handlePagination(page)}
                            page={pageable.page}
                            totalPages={pageable.totalPages}
                        />
                    </div>
                )}
            </div>
        </Layout>

    )

}

export default HomePage;