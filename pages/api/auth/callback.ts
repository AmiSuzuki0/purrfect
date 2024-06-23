import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import cookie from 'cookie';

interface OAuthAccessResult extends WebAPICallResult {
  access_token: string;
  scope: string;
  authed_user: {
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
      code: code as string,
      redirect_uri: redirectUri,
    }) as OAuthAccessResult;

    console.log(response);
    const userToken = response.authed_user.access_token;
    console.log('User OAuth Access Response:', response); // Log OAuth response

    // トークンをクッキーに保存
    res.setHeader('Set-Cookie', cookie.serialize('token', userToken, {
      httpOnly: false,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 day
      sameSite: 'strict',
      path: '/',
    }));

    res.redirect('/timeline');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
