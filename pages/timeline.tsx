import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Rammetto_One } from 'next/font/google';
import Loading from '../components/loading';
import Cookies from 'js-cookie';

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
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch(`/api/slack`);
      const data = await response.json();

      setChannels(data.channels || []);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setChannels([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewMessages = async () => {
    try {
      const response = await fetch(`/api/check-messages`);
      const data = await response.json();
      console.log(data.newMessages);
      if (data.newMessages) {
        await fetchData(token as string); // 新しいメッセージがある場合はデータを再取得
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  const handleClick = async (channelId: string, threadTs: string, index: number) => {
    setShowReplies((prev) => ({ ...prev, [index]: !prev[index] }));
    if (messages[index] !== undefined) {
      const message = messages[index];
      if (message.reply_count !== undefined && message.reply_count > 0) {
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
      }
    }
  };

  const handleCommentChange = (index: number, text: string) => {
    setCommentText((prev) => ({ ...prev, [index]: text }));
  };

  const handleCommentSubmit = async (channelId: string, threadTs: string, index: number) => {
    if (!commentText[index]) return;
    setLoading(true);
    console.log(channelId, threadTs, commentText[index]);
    try {
      const response = await fetch(`/api/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          thread_ts: threadTs,
          text: commentText[index],
        }),
      });

      if (response.ok) {
        setCommentText((prev) => ({ ...prev, [index]: '' }));
        handleClick(channelId, threadTs, index);
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData(token as string);
    const interval = setInterval(() => {
      checkForNewMessages();
    }, 60000); // 1分ごとにチェック
    return () => clearInterval(interval);
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
              <div className="rounded-lg p-6 pb-4 box-border shadow-[1px_1px_12px_0_rgba(255,255,255,0.1)]" key={index}>
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

                <div className="flex mt-2">
                  <button onClick={() => handleClick(message.channel_id ?? '', message.thread_ts ?? '', index)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                      />
                    </svg>
                    {message.reply_count && message.reply_count > 0 && typeof message.reply_count !== 'undefined' && message.reply_count}
                  </button>
                </div>
                {showReplies[index] && (
                  <>
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
                              <p className="break-all mt-2">{date.text}</p>
                            </div>
                          ),
                      )}
                    <div className="mt-4 grid grid-cols-6 gap-4">
                      <textarea
                        value={commentText[index] || ''}
                        onChange={(e) => handleCommentChange(index, e.target.value)}
                        className="col-span-5 bg-transparent pl-4 pr-4 rounded-lg w-full shadow-[inset_1px_1px_10px_0_rgba(255,255,255,0.2)] p-2"
                        placeholder="返信を入力"
                      ></textarea>
                      <button
                        onClick={() => handleCommentSubmit(message.channel_id ?? '', message.ts ?? '', index)}
                        className="col-span-1 p-2 mt-2 h-8 box-border ml-auto bg-indigo-500 rounded-lg w-full text-slate-100 text-xs self-end"
                      >
                        返信
                      </button>
                    </div>
                  </>
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
