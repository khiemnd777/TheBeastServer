export const CONNECTION_PORT = 7777;
export const CONNECTION_PATH = '/thebeast';
export const SAME_SIDE = 'same-side';
export const EXTERNAL_SIDE = 'external-side';
export const SERVER = 'server';

//#region Server events
export const EVENT_CONNECT = 'connect';
export const EVENT_DISCONNECT = 'disconnect';
export const EVENT_REGISTER = 'register';
//#endregion

//#region Player events
export const EVENT_PLAYER_TRANSLATE = 'player translate';
export const EVENT_PLAYER_ROTATE = 'player rotate';
export const EVENT_PLAYER_PLAY = 'play';
export const EVENT_PLAYER_FLIP = 'player flip';
export const EVENT_PLAYER_HP = 'player hp';
export const EVENT_PLAYER_MAX_HP = 'player max hp';
export const EVENT_PLAYER_DIE = 'player die';
export const EVENT_HP_PICKER = 'hp picker';
export const EVENT_HP_PICKER_CONSUME = 'hp picker consume';
export const EVENT_WEAPON_TRIGGER = 'weapon trigger';
export const EVENT_EYE_MOVE = 'eye move';
export const EVENT_ARM_ROTATE = 'arm rotate';
export const EVENT_HEAD_ROTATE = 'head rotate';
export const EVENT_LOAD_PLAYERS = 'load players';
export const EVENT_CLIENT_CONNECTED = 'connected';
export const EVENT_CLIENT_REGISTERED = 'registered';
export const EVENT_CLIENT_PLAYER_TRANSLATE = 'player translate';
export const EVENT_CLIENT_PLAYER_ROTATE = 'player rotate';
export const EVENT_CLIENT_PLAYER_SYNC_HP = 'player sync hp';
export const EVENT_CLIENT_PLAYER_SYNC_MAX_HP = 'player sync max hp';
export const EVENT_CLIENT_SYNC_HP_PICKER = 'sync hp picker';
export const EVENT_CLIENT_SYNC_HP_PICKER_CONSUME = 'sync hp picker consume';
export const EVENT_CLIENT_PLAYER_WAS_DEAD = 'player dead';
export const EVENT_CLIENT_OTHER_REGISTERED = 'other registered';
export const EVENT_CLIENT_OTHER_DISCONNECTED = 'other disconnected';
export const EVENT_CLIENT_OTHER_PLAYER_FLIP = 'other player flip';
export const EVENT_CLIENT_OTHER_EYE_MOVE = 'other eye move';
export const EVENT_CLIENT_OTHER_ARM_ROTATE = 'other arm rotate';
export const EVENT_CLIENT_OTHER_HEAD_ROTATE = 'other head rotate';
export const EVENT_CLIENT_LOADED_PLAYER = 'loaded player';
export const EVENT_CLIENT_OTHER_WEAPON_TRIGGER = 'other weapon trigger';
export const EVENT_CLIENT_EMPTY_LIST = 'empty list';
export const EVENT_CLIENT_REGISTER_PLAYER_FINISHED = 'register player finished';
export const EVENT_CLIENT_SYNC_REGISTER_PLAYER_FINISHED =
  'sync register player finished';
export const EVENT_REQUIRE_REGISTER_PLAYER = 'server register player';
export const EVENT_REQUIRE_GETTING_PLAYERS = 'request getting players';
export const EVENT_RESPONSE_GETTING_PLAYERS = 'response getting players';
export const EVENT_DOWNLOAD_PLAYERS = 'download players';
//#endregion

//#region Fodder events
export const EVENT_FODDER_CREATE = 'fodder create';
export const EVENT_FODDER_CREATE_SYNC = 'fodder create sync';
export const EVENT_FODDER_TRANSLATE = 'fodder translate';
export const EVENT_FODDER_TRANSLATE_SYNC = 'fodder translate sync';
export const EVENT_FODDER_REQUEST_LOADING = 'fodder request loading';
export const EVENT_FODDER_GETTING_ALL = 'fodder getting all';
export const EVENT_FODDER_SEND_GETTING_ALL = 'fodder send getting all';
export const EVENT_FODDER_FETCHING = 'fodder fetching';
//#endregion

//#region Bullet events
export const EVENT_BULLET_REGISTER = 'bullet register';
export const EVENT_BULLET_REMOVE = 'bullet remove';
export const EVENT_CLIENT_BULLET_REGISTERED = 'bullet registered';
export const EVENT_CLIENT_BULLET_OTHER_REGISTERED = 'bullet other registered';
export const EVENT_CLIENT_BULLET_OTHER_REMOVED = 'bullet other removed';
//#endregion
