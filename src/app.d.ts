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
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

interface RecentMessagesReturnType {
  user_id: number
  username: string | null
  first_name: string
  last_name: string | null
  user_photo: string | null
  message_id: number
  reply_to_message_id: number | null
  message_type: string
  text: string | null
  text_entities: string | null
  file: string | null
  date: string
}

export { GitHubOrgsAPIResponseType, RecentMessagesReturnType };
