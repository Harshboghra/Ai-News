import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

const socket = io(SOCKET_URL, {
    transports: ["websocket"]
});

export default socket;
