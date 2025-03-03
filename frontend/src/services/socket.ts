import { io } from "socket.io-client";
import { websocketUrl } from "../services/api";
import { TradeHistory, TradePrice, TransactionHistory } from "../utils/type";

type SocketHandlers = {
  setTransactions: (data: TransactionHistory[]) => void;
  setTrade: (data: TradeHistory[]) => void;
  setTradePrice: (data: TradePrice) => void;
};

export const createSocketConnection = (handlers: SocketHandlers) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  const socket = io(websocketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully");
    socket.emit("get_transaction_history");
    socket.emit("get_trade_history"); 
    socket.emit("get_current_price");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("get_transaction_history", (data) => {
    handlers.setTransactions(data.transactions || data);
  });

  socket.on("trade_history", (data) => {
    handlers.setTrade(data.trade_history || data);
  });

  socket.on("trade_price", (data: TradePrice) => {
    handlers.setTradePrice(data);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};
