import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import cookie from 'cookie';

interface Channel {
  id: string;
  name: string;
}

interface Message {
  ts: string;
  text: string;
  user: string;
  url: string;
  subtype?: string;
  thread_ts?: string;
  reply_count?: number;
  channel_id: string;
  userInfo?: {
    profile: {
      image_48: string;
    };
    real_name: string;
  };
  res?: Res[];
}

interface Res {
  ts: string;
  text: string;
  user: string;
  url: string;
  userInfo?: {
    profile: {
      image_48: string;
    };
    real_name: string;
  };
}

let cachedData: { channels: Channel[]; messages: Message[] } = { channels: [], messages: [] };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //   const cookies = cookie.parse(req.headers.cookie || '');
  //   const token = cookies.token;
  //   console.log(res);
  //   console.log(token);
  if (req.method === 'POST') {
    const { type, challenge, event } = req.body;

    // URL verification
    if (type === 'url_verification') {
      return res.status(200).json({ challenge });
    }

    // Event handling
    if (type === 'event_callback' && event && event.type === 'message') {
      const { channel, text, user } = event;
      //timesだけに制限したいけど現状チャンネルに投稿されたら更新
      //   const result = await client.conversations.info({ channel: event.channel });
      //   if (channel.startsWith('times-')) {
      console.log(`New message in channel ${channel}: ${text} by user ${user}`);
      // Fetch and update data here
      //await fetchData(client);
      try {
        // const response = await client.conversations.list();
        // console.log(response);
        // Handle response data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      //   }
    }
    return res.status(200).send('OK');
  }

  res.status(405).end(); // Method Not Allowed
};

export const getCachedData = () => cachedData;
