import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Rammetto_One } from "next/font/google";
import Loading from '../components/loading';
import Cookies from 'js-cookie';

const RammettoOne = Rammetto_One({ subsets: ["latin"], weight: ["400"] });

interface Message {
  ts: string;
  text: string;
  user: string;
  url:string;
  userInfo?: {
    profile: {
      image_48: string;
    };
    real_name: string;
  };
}

interface Channel {
  id: string;
  name: string;
}

const Timeline: React.FC = () => {
  const token = Cookies.get('token');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await fetch(`/api/slack?token=${token}`);
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

  useEffect(() => {
    if (!token) return;

    fetchData(token as string);

    const interval = setInterval(() => {
      fetchData(token as string);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="bg-slate-900 min-h-lvh text-slate-400 pt-8 pb-8">
        <div className="container sm:mx-auto pr-4 pl-4 box-border max-w-xl mr-auto ml-auto">
        <h1 className={`${RammettoOne.className} md:-ml-8 text-4xl md:text-7xl text-center`}><a href="/"><img className="inline-block mr-2 w-16 md:inline md:w-24 md:mr-4" src="/img/logo01.png" alt="" />purrfect</a></h1>
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
                                    <small className='text-slate-600 ml-2'>{new Date(parseFloat(message.ts) * 1000).toLocaleString()}</small>
                                </div>
                            )}
                            <p className="break-all mt-2 line-clamp-4">{message.text}</p>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default Timeline;
