import { initSocket } from "./socket-init";
import env from "./env.config";

const port = env<number>("CONNECTION_PORT");
const path = env<string>("CONNECTION_PATH");
const secureServerOr = env<boolean>("SOCKET_SECURE") ? 'secured server' : 'server';
// Initialize the socket server.
initSocket(port, path);
console.log(`The ${secureServerOr} runs on {port:${port}, path:${path}}`);
