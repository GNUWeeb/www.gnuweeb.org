import { getOrgMembers, getRecentMessages } from "$lib";
import type { PageLoad } from "./$types";


export const load = (async () => {
  const [memberListData, recentMsgData] = await Promise.all([
    getOrgMembers(),
    getRecentMessages(),
  ]);

  return {
    memberListData,
    recentMsgData
  }
}) satisfies PageLoad;
