import { initSocket } from './socket-init';
import { CONNECTION_PORT, CONNECTION_PATH } from './constants';
const port = CONNECTION_PORT;
const path = CONNECTION_PATH;
initSocket(port, path);
console.log(`Server runs on {port:${port}, path:${path}}`);
