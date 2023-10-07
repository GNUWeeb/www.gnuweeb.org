import type { GitHubOrgsAPIResponseType, RecentMessagesReturnType } from "$types";
import { API_URL } from "./constants";


export const getOrgMembers = async (): Promise<GitHubOrgsAPIResponseType[]> => {
  const response = await fetch("https://api.github.com/orgs/gnuweeb/members");
  const data: GitHubOrgsAPIResponseType[] = await response.json();

  data.sort((
    left: GitHubOrgsAPIResponseType,
    right: GitHubOrgsAPIResponseType
  ) => {
    const usernameA = left.login.toLowerCase();
    const usernameB = right.login.toLowerCase();
    if (usernameA < usernameB) return -1;
    if (usernameA > usernameB) return 1;
    return 0;
  });

  return data;
}

export const getRecentMessages = async (): Promise<RecentMessagesReturnType[] | []> => {
  try {
    const response = await fetch(API_URL + "/zxc.php?action=get_messages&chat_id=-1001483770714&limit=50");
    const { data } = (await response.json()).result;

    const transformedData = data.map((item: any) => {
      return {
        user_id: item[0],
        username: item[1],
        first_name: item[2],
        last_name: item[3],
        user_photo: item[4],
        message_id: item[5],
        reply_to_message_id: item[6],
        message_type: item[7],
        text: item[8],
        text_entities: item[9] ? JSON.parse(item[9]) : null,
        file: item[10],
        date: item[11]
      };
    });

    return transformedData.reverse();
  } catch {
    return [];
  }
}

const hashCode = (name: string) => {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
      var character = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + character;
  }
  return Math.abs(hash);
}

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
    rose: "text-rose-400 border-rose-400",
  };
  const colorNames = Object.keys(colorData);
  return colorData[colorNames[hashCode(name) % colorNames.length]].split(" ");
}

export const cleanMessageText = (text: string) => {
  return text.replaceAll(/\n/g, " ");
}

export const setupUserName = (first: string, last: string | null) => {
  const firstName = first.trimEnd();
  let lastName = "";
  if(last !== null) {
    lastName = " " + last.trimEnd();
  }
  return [ firstName, lastName ];
}

export const getRepliedMessage = (
  current: RecentMessagesReturnType,
  messages: RecentMessagesReturnType[]
): RecentMessagesReturnType[] => {
  return messages.filter(msg => {
    return msg.message_id === current.reply_to_message_id
  });
}
