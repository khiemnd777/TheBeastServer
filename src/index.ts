import { initSocket } from './socket-init';
import { CONNECTION_PORT, CONNECTION_PATH } from './constants';
import { initWeaponSpawner } from './weapon-spawner/weapon-spawner';
const port = CONNECTION_PORT;
const path = CONNECTION_PATH;
// Initialize the socket server.
initSocket(port, path);
console.log(`The server runs on {port:${port}, path:${path}}`);
// Initialize the weapon spawner.
initWeaponSpawner(port, path);
console.log(`The weapon spawner has been initialized.`);
