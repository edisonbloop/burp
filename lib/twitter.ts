import { TwitterApi } from "twitter-api-v2";

/** OAuth 1.0a client — posts as the BURP account */
export function getTwitterClient() {
  const apiKey            = process.env.TWITTER_API_KEY;
  const apiSecret         = process.env.TWITTER_API_SECRET;
  const accessToken       = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("Missing Twitter API credentials in environment variables.");
  }

  return new TwitterApi({
    appKey:            apiKey,
    appSecret:         apiSecret,
    accessToken:       accessToken,
    accessSecret:      accessTokenSecret,
  });
}

export async function postTweet(text: string): Promise<{ id: string; text: string }> {
  const client = getTwitterClient();
  const { data } = await client.v2.tweet(text);
  return data;
}
