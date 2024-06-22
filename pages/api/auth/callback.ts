import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient, WebAPICallResult } from '@slack/web-api';

interface OAuthAccessResult extends WebAPICallResult {
  access_token: string;
  scope: string;
  authed_user?: {
    id: string;
    access_token: string;
    token_type: string;
  };
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code as string;
  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SLACK_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    res.status(500).json({ error: 'Missing Slack client ID, client secret, or redirect URI' });
    return;
  }

  const client = new WebClient();

  try {
    const response = await client.oauth.v2.access({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
    }) as OAuthAccessResult;

    const userToken = response.authed_user.access_token;
    console.log('User OAuth Access Response:', response); // Log OAuth response
    res.redirect(`/timeline?token=${userToken}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
