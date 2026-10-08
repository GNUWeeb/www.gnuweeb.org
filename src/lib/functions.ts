import type {
  GitHubOrgsAPIResponseType,
  RecentMessagesReturnType,
  TGDMessageForward,
  TGDMessageSender,
  TGDResponse
} from "$types";
import { TGD_API_URL, TGD_BASE_URL } from "./constants";

export const getOrgMembers = async (): Promise<GitHubOrgsAPIResponseType[]> => {
  const response = await fetch("https://api.github.com/orgs/gnuweeb/members");
  const data: GitHubOrgsAPIResponseType[] = await response.json();

  data.sort((left: GitHubOrgsAPIResponseType, right: GitHubOrgsAPIResponseType) => {
    const usernameA = left.login.toLowerCase();
    const usernameB = right.login.toLowerCase();
    if (usernameA < usernameB) return -1;
    if (usernameA > usernameB) return 1;
    return 0;
  });

  return data;
};

export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${TGD_BASE_URL}${url}`;
  return `${TGD_BASE_URL}/${url}`;
};

export const getRecentMessages = async (options?: {
  limit?: number;
  after?: number | string | null;
}): Promise<TGDResponse> => {
  const limit = options?.limit ?? 30;
  const afterParam = options?.after != null ? `&after=${options.after}` : "";
  const targetUrl = `${TGD_API_URL}?limit=${limit}${afterParam}`;

  try {
    let response: Response;
    try {
      response = await fetch(targetUrl);
    } catch (fetchErr) {
      // In Vite development mode, fall back to dev proxy if CORS blocked localhost
      if (typeof window !== "undefined" && import.meta.env?.DEV) {
        const proxyUrl = targetUrl.replace(TGD_BASE_URL, "/tgd-proxy");
        response = await fetch(proxyUrl);
      } else {
        throw fetchErr;
      }
    }

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const data: TGDResponse = await response.json();
    if (data.messages && Array.isArray(data.messages)) {
      data.messages = data.messages.map((m) => {
        const localDay = formatDay(m.date, m.day);
        return localDay ? { ...m, day: localDay } : m;
      });
    }
    return data;
  } catch (err) {
    console.error("Error fetching messages from TGD API:", err);
    return {
      limit,
      messages: [],
      oldest_msg_id: undefined,
      newest_msg_id: undefined,
      older_after: null,
      newer_after: null
    };
  }
};

const hashCode = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const character = name.charCodeAt(i);
    hash = (hash << 5) - hash + character;
  }
  return Math.abs(hash);
};

export const getFixedRandomColor = (name: string) => {
  const colorData: Record<string, string> = {
    red: "text-red-400 border-red-400",
    yellow: "text-yellow-400 border-yellow-400",
    blue: "text-blue-400 border-blue-400",
    sky: "text-sky-400 border-sky-400",
    purple: "text-purple-400 border-purple-400",
    orange: "text-orange-400 border-orange-400",
    amber: "text-amber-400 border-amber-400",
    lime: "text-lime-400 border-lime-400",
    green: "text-green-400 border-green-400",
    emerald: "text-emerald-400 border-emerald-400",
    teal: "text-teal-400 border-teal-400",
    cyan: "text-cyan-400 border-cyan-400",
    indigo: "text-indigo-400 border-indigo-400",
    violet: "text-violet-400 border-violet-400",
    fuchsia: "text-fuchsia-400 border-fuchsia-400",
    pink: "text-pink-400 border-pink-400",
    rose: "text-rose-400 border-rose-400"
  };
  const colorNames = Object.keys(colorData);
  return colorData[colorNames[hashCode(name) % colorNames.length]].split(" ");
};

export const unescapeHtml = (str: string | null | undefined): string => {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      try {
        return String.fromCodePoint(code);
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      try {
        return String.fromCodePoint(code);
      } catch {
        return _;
      }
    })
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
};

export const cleanMessageText = (text: string) => {
  return unescapeHtml(text).replaceAll(/\n/g, " ");
};

export const formatForwardSource = (
  f: TGDMessageForward | null | undefined,
  currentSender?: TGDMessageSender | null,
  lookupUser?: ((userId: number) => string | undefined) | Map<number, string>
): string => {
  if (!f) return "";

  // 1. Explicit sender_name returned by TGD API
  const name = unescapeHtml(f.sender_name).trim();
  if (name) return name;

  // 2. If the user_id matches the message sender, use the sender name
  if (f.user_id != null && currentSender?.id === f.user_id && currentSender.name) {
    const senderName = unescapeHtml(currentSender.name).trim();
    if (senderName) return senderName;
  }

  // 3. If a lookup function or map can resolve the user_id from chat history
  if (f.user_id != null && lookupUser) {
    const resolved =
      typeof lookupUser === "function" ? lookupUser(f.user_id) : lookupUser.get(f.user_id);
    if (resolved) {
      const resolvedName = unescapeHtml(resolved).trim();
      if (resolvedName) return resolvedName;
    }
  }

  // 4. Fallbacks by origin type
  if (f.type === "channel") return "a channel";
  if (f.type === "user") return "a user";

  // 5. Fallbacks by ID
  if (f.user_id != null) return `user #${f.user_id}`;
  if (f.chat_id != null) return `chat #${f.chat_id}`;

  return "hidden sender";
};

export const setupUserName = (first: string, last: string | null) => {
  const firstName = first.trimEnd();
  let lastName = "";
  if (last !== null) {
    lastName = " " + last.trimEnd();
  }
  return [firstName, lastName];
};

export const getRepliedMessage = (
  current: RecentMessagesReturnType,
  messages: RecentMessagesReturnType[]
): RecentMessagesReturnType[] => {
  if (!current.reply) return [];
  return messages.filter((msg) => msg.msg_id === current.reply?.msg_id);
};

export const dateFormat = (
  date: string,
  includeSeconds: boolean = true,
  amPm: boolean = false
): string => {
  if (!date) return "";
  // TGD API returns UTC date format e.g. "2026-10-08 12:48:57"
  const utcDateStr = date.endsWith("Z") ? date : date.replace(" ", "T") + "Z";
  const ts = new Date(utcDateStr);
  if (isNaN(ts.getTime())) return date;

  return ts.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: amPm
  });
};

export const formatDay = (dateStr: string, dayStr?: string): string => {
  if (!dateStr) return dayStr ?? "";
  const utcDateStr = dateStr.endsWith("Z") ? dateStr : dateStr.replace(" ", "T") + "Z";
  const d = new Date(utcDateStr);
  if (isNaN(d.getTime())) return dayStr ?? "";

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};
