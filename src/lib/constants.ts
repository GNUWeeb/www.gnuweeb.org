export const TGD_BASE_URL = "https://tgd.gnuweeb.org";
export const TGD_CHAT_ID = "-1001483770714";
export const TGD_API_URL = `${TGD_BASE_URL}/v1/chats/group/${TGD_CHAT_ID}/messages`;
export const TGD_WEB_CHAT_URL = `${TGD_BASE_URL}/groups/${TGD_CHAT_ID}/chat`;

// Backwards compatibility aliases
export const API_URL = TGD_API_URL;
export const STORAGE_URL = `${TGD_BASE_URL}/files/`;
