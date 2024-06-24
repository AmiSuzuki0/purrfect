import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import cookie from 'cookie';

interface UserInfo {
    profile: {
      image_48: string;
    };
    real_name: string;
  }

interface UsersInfoResult extends WebAPICallResult {
user: UserInfo;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    const channelId = req.query.channel_id as string;
    const threadTs = req.query.thread_ts as string;

  if (!token || !channelId || !threadTs) {
    res.status(400).json({ error: 'Missing token, channel ID, or thread timestamp' });
    return;
  }

  const client = new WebClient(token);

  try {
    const result = await client.conversations.replies({
      channel: channelId,
      ts: threadTs,
    });

    const messages = await Promise.all(result.messages.map(async (message: any) => {
        if (message.user) {
          const userInfo = await client.users.info({ user: message.user }) as UsersInfoResult;
          message.userInfo = {
            profile: {
              image_48: userInfo.user.profile.image_48,
            },
            real_name: userInfo.user.real_name,
          };
        }
        return message;
      }));
  

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
