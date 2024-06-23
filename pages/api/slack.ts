import { NextApiRequest, NextApiResponse } from 'next';
import { WebClient, WebAPICallResult } from '@slack/web-api';

interface UserInfo {
  profile: {
    image_48: string;
  };
  real_name: string;
}

interface Message {
  ts: string;
  text: string;
  user: string;
  userInfo?: UserInfo; // ユーザー情報がある場合にのみ定義
  url?: string; // URLがある場合にのみ定義
  subtype?: string; // subtypeがある場合にのみ定義
}

interface Channel {
  id: string;
  name: string;
}

interface ConversationsHistoryResult extends WebAPICallResult {
  messages: Message[];
}

interface UsersInfoResult extends WebAPICallResult {
  user: UserInfo;
}

const fetchChannelsAndMessages = async (token: string): Promise<{ channels: Channel[], messages: Message[] }> => {
  const client = new WebClient(token);

  try {
    // Fetch channels with "times-" prefix
    const result = await client.conversations.list({ types: 'public_channel' });
    const timesChannels: any[]  = result.channels.filter((channel: any) => {
      // チャンネル名が null や undefined であれば、startsWith メソッドを使用しない
      if (!channel.name) {
        return false;
      }
      return channel.name.startsWith('times-');
    });

    // Fetch messages from each "times-" channel
    const allMessages: any[] = [];
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    for (const channel of timesChannels) {
      try {
        const messagesResult = await client.conversations.history({
          channel: channel.id,
          limit: 5, // 50件までのメッセージを取得
        }) as ConversationsHistoryResult;
    
        // フィルタリングとユーザー情報の取得
        const filteredMessages = messagesResult.messages.filter((message: Message) => {
          // 特定の条件を持つメッセージをフィルタリングする例
          return (!message.subtype || message.subtype !== 'channel_join') && (new Date(parseFloat(message.ts) * 1000) > twoWeeksAgo);// "has joined the channel" 以外のメッセージを残す  & 2週間前のメッセージを削除

        });
    
        // メッセージごとにユーザー情報を取得して追加
         
        for (const message of filteredMessages) {
          if (message.user) {
            const userInfoResult = await client.users.info({ user: message.user }) as UsersInfoResult;
            message.userInfo = userInfoResult.user;
          }
          message.url = `https://${process.env.NEXT_PUBLIC_SLACK_WORKSPACE}.slack.com/archives/${channel.id}/p${message.ts.replace('.', '')}`;
        }
    
        // フィルタリングされたメッセージをallMessagesに追加
        allMessages.push(...filteredMessages);
      } catch (error) {
        console.error(`Error fetching messages for channel ${channel.id}:`, error);
        continue; // エラーが発生した場合は次のチャンネルに進む
      }
    }
    
    // メッセージをタイムスタンプの降順（新しい順）にソート
    allMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
    // console.log('All messages:', allMessages);
    return { channels: timesChannels, messages: allMessages };
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.query.token as string;

  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  try {
    const data = await fetchChannelsAndMessages(token);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
