// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

interface GitHubOrgsAPIResponseType {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface TGDMessageSender {
  id: number;
  kind: "user" | "group" | "channel" | string;
  name: string;
  photo_file_id?: number;
  photo_url?: string;
  username?: string | null;
}

interface TGDMessageMedia {
  file_id?: number;
  name?: string;
  render?: "image" | "video" | "animation" | "lottie" | "audio" | "file" | string;
  size?: number;
  stored?: boolean;
  url: string;
}

interface TGDMessageReply {
  content_type: string;
  deleted?: boolean;
  href?: string;
  in_chat?: boolean;
  msg_id: number;
  sender_name?: string;
  snippet?: string;
}

interface TGDMessageForward {
  user_id?: number;
  chat_id?: number;
  sender_name?: string;
  type?: string;
}

interface TGDLinkPreview {
  author?: string;
  description?: string;
  display_url?: string;
  site_name?: string;
  title?: string;
  type?: string;
  url: string;
  media?: TGDMessageMedia;
}

interface TGDAlbumItem {
  content_type: string;
  is_deleted?: boolean;
  media?: TGDMessageMedia;
  msg_id: number;
}

interface TGDEdit {
  content_type: string;
  edit_date?: string;
  text?: string;
  media?: TGDMessageMedia;
}

interface TGDMessage {
  msg_id: number;
  content_type: string;
  date: string;
  day: string;
  sender: TGDMessageSender;
  show_sender?: boolean;
  text: string;
  reply?: TGDMessageReply | null;
  forward?: TGDMessageForward | null;
  media?: TGDMessageMedia | null;
  link_preview?: TGDLinkPreview | null;
  is_album?: boolean;
  album_id?: number;
  items?: TGDAlbumItem[];
  is_edited?: boolean;
  edits?: TGDEdit[];
  is_deleted?: boolean;
  deleted_at?: string;
  is_outgoing?: boolean;
  is_service?: boolean;
  service_type?: string;
  author_signature?: string;
}

interface TGDResponse {
  limit: number;
  messages: TGDMessage[];
  oldest_msg_id?: number;
  newest_msg_id?: number;
  older_after?: number | null;
  newer_after?: number | null;
}

type RecentMessagesReturnType = TGDMessage;

export {
  GitHubOrgsAPIResponseType,
  RecentMessagesReturnType,
  TGDMessage,
  TGDResponse,
  TGDMessageSender,
  TGDMessageMedia,
  TGDMessageReply,
  TGDMessageForward,
  TGDLinkPreview,
  TGDAlbumItem,
  TGDEdit
};
