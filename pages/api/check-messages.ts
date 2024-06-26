import { NextApiRequest, NextApiResponse } from 'next';
import { isNewMessage, resetNewMessageFlag } from './events';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const newMessages = isNewMessage();
    if (newMessages) {
      resetNewMessageFlag();
    }
    return res.status(200).json({ newMessages });
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
