import { NextApiRequest, NextApiResponse } from 'next';

let newMessageFlag = false;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { type, challenge, event } = req.body;

    // URL verification
    if (type === 'url_verification') {
      return res.status(200).json({ challenge });
    }

    // Event handling
    if (type === 'event_callback' && event && event.type === 'message') {
      // const { channel, text, user } = event;
      // console.log(`New message in channel ${channel}: ${text} by user ${user}`);
      newMessageFlag = true;
      try {
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    return res.status(200).send('OK');
  }

  res.status(405).end(); // Method Not Allowed
};

export const isNewMessage = () => newMessageFlag;
export const resetNewMessageFlag = () => {
  newMessageFlag = false;
};
