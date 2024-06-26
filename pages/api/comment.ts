import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient } from '@slack/web-api';
import cookie from 'cookie';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { channel, thread_ts, text } = req.body;

  if (!channel || !thread_ts || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = new WebClient(token);

  try {
    const result = await client.chat.postMessage({
      channel,
      thread_ts,
      text,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({ error: 'Error posting comment' });
  }
};
