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
  const emojiData = require('emoji-datasource');

  if (!token || !channelId || !threadTs) {
    res.status(400).json({ error: 'Missing token, channel ID, or thread timestamp' });
    return;
  }

  const client = new WebClient(token);

  function replaceEmojiShortcodes(text: string): string {
    const shortcodeRegex = /:([a-zA-Z0-9_+-]+):/g;
    return text.replace(shortcodeRegex, (match, shortcode) => {
      const emoji = emojiData.find((emoji) => emoji.short_names.includes(shortcode));
      if (emoji && emoji.unified) {
        const codePoint = parseInt(emoji.unified, 16); // 絵文字の unified 値を16進数から数値に変換する
        return String.fromCodePoint(codePoint);
      } else {
        console.warn(`Emoji not found for shortcode: ${shortcode}`);
        return match;
      }
    });
  }

  try {
    const result = await client.conversations.replies({
      channel: channelId,
      ts: threadTs,
    });

    if (!result.messages) {
      throw new Error('No messages found in the thread.');
    }

    const messages = await Promise.all(
      result.messages.map(async (message: any) => {
        if (message.user) {
          const userInfo = (await client.users.info({ user: message.user })) as UsersInfoResult;
          message.userInfo = {
            profile: {
              image_48: userInfo.user.profile.image_48,
            },
            real_name: userInfo.user.real_name,
          };
        }

        if (message.text) {
          message.text = replaceEmojiShortcodes(message.text);
        }

        if (message.text) {
          const urlPattern = /<((https?:\/\/[^\s|>]+?)\|?(https?:\/\/[^\s|>]+?)?)>/g;
          message.text = message.text.replace(urlPattern, (match, url1, url2) => {
            const url = url2 ? url2 : url1; // パイプがある場合とない場合でURLを選択
            return `<a target="_blank" href="${url}">${url}</a>`;
          });
        }

        return message;
      }),
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
