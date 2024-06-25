import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Rammetto_One } from 'next/font/google';
import Loading from '../components/loading';
import Cookies from 'js-cookie';
import { getCachedData } from './api/events';

const RammettoOne = Rammetto_One({ subsets: ['latin'], weight: ['400'] });

interface Message {
  ts: string;
  text: string;
  user: string;
  url: string;
  subtype?: string; // subtypeがある場合にのみ定義
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

interface Channel {
  id: string;
  name: string;
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

const Timeline: React.FC = () => {
  const token = Cookies.get('token');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replies, setReplies] = useState<Res[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch(`/api/slack`);
      const data = await response.json();
      //const data = getCachedData(); // キャッシュされたデータを取得

      setChannels(data.channels || []);
      setMessages(data.messages || []);
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setChannels([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (channelId: string, threadTs: string, index: number) => {
    // console.log('Channel ID:', channelId);
    // console.log('Thread TS:', threadTs);
    try {
      const replyResponse = await fetch(`/api/reply?&channel_id=${channelId}&thread_ts=${threadTs}`);
      const data = await replyResponse.json();

      if (Array.isArray(data)) {
        const validData: Res[] = data.map((item) => ({
          ts: item.ts,
          text: item.text,
          user: item.user,
          url: item.url,
          userInfo: item.userInfo
            ? {
                profile: {
                  image_48: item.userInfo.profile.image_48,
                },
                real_name: item.userInfo.real_name,
              }
            : undefined,
        }));
        setReplies(validData);
      } else {
        console.error('Data is not an array:', data);
        setReplies([]);
      }

      setMessages((prevMessages) => {
        return prevMessages.map((message, idx) => {
          if (idx === index) {
            return {
              ...message,
              res: data.map((item) => ({
                ts: item.ts,
                text: item.text,
                user: item.user,
                url: item.url,
                userInfo: item.userInfo
                  ? {
                      profile: {
                        image_48: item.userInfo.profile.image_48,
                      },
                      real_name: item.userInfo.real_name,
                    }
                  : undefined,
              })),
            };
          } else {
            return message;
          }
        });
      });
    } catch (error) {
      console.error('Error fetching replies:', error);
      setReplies([]);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchData(token as string);

    // const interval = setInterval(() => {
    //   fetchData(token as string);
    // }, 300000); // 5 minutes

    // return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="bg-slate-900 min-h-lvh text-slate-400 pt-8 pb-8">
      <div className="container sm:mx-auto pr-4 pl-4 box-border max-w-xl mr-auto ml-auto">
        <h1 className={`${RammettoOne.className} md:-ml-8 text-4xl md:text-7xl text-center`}>
          <a href="/">
            <img className="inline-block mr-2 w-16 md:inline md:w-24 md:mr-4" src="/img/logo01.png" alt="" />
            purrfect
          </a>
        </h1>
        <div className="grid w-full mt-8 mb:mt-16 gap-y-6 md:gap-y-8">
          {loading ? (
            <Loading />
          ) : (
            messages.map((message, index) => (
              <div className="rounded-lg p-6 box-border shadow-[1px_1px_12px_0_rgba(255,255,255,0.1)]" key={index}>
                <a href={message.url} target="_blank">
                  {message.userInfo && (
                    <div className="flex gap-x-2 items-center">
                      <img src={message.userInfo.profile.image_48} alt={message.userInfo.real_name} className="rounded-full w-8 mr-2" />
                      <strong>{message.userInfo.real_name}</strong>
                      <small className="text-slate-600 ml-2">{new Date(parseFloat(message.ts) * 1000).toLocaleString()}</small>
                    </div>
                  )}
                  <p className="break-all mt-2 line-clamp-4">{message.text}</p>
                </a>
                {message.reply_count && message.reply_count > 0 && typeof message.reply_count !== 'undefined' && (
                  <div className="flex mt-2">
                    <button onClick={() => handleClick(message.channel_id ?? '', message.thread_ts ?? '', index)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                        />
                      </svg>
                      {message.reply_count}
                    </button>
                  </div>
                )}
                {message.res &&
                  message.res.map(
                    (date, index) =>
                      index !== 0 && (
                        <div className="block mt-4 ml-8" key={index}>
                          {date.userInfo && (
                            <div className="flex gap-x-2 items-center">
                              <img src={date.userInfo.profile.image_48} alt={date.userInfo.real_name} className="rounded-full w-8 mr-2" />
                              <strong>{date.userInfo.real_name}</strong>
                              <small className="text-slate-600 ml-2">{new Date(parseFloat(date.ts) * 1000).toLocaleString()}</small>
                            </div>
                          )}
                          <p className="break-all mt-2 line-clamp-4">{date.text}</p>
                        </div>
                      ),
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
