import React from 'react';
const RammettoOne = Rammetto_One({ subsets: ['latin'], weight: ['400'] });
import { Rammetto_One } from 'next/font/google';

const Home: React.FC = () => {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('Missing Slack client ID or redirect URI');
      return;
    }

    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=channels:history,channels:read,users:read,groups:read&user_scope=channels:history,channels:read,users:read,groups:read&redirect_uri=${redirectUri}`;

    window.location.href = slackAuthUrl;
  };

  return (
    <div className="bg-slate-900 h-lvh grid items-center justify-items-center text-slate-400 pt-8 pb-8">
      <div className="w-fit">
        <h1 className={`${RammettoOne.className} md:-ml-12 text-5xl md:text-7xl text-center`}>
          <img className="block mr-auto ml-auto mb-2 w-20 md:inline md:w-24 md:mr-4 md:mb-0" src="/img/logo01.png" alt="" />
          purrfect
        </h1>
        <button className="flex items-center justify-items-center p-4 mt-8 mr-auto ml-auto bg-indigo-500 rounded-lg text-slate-100" onClick={handleLogin}>
          <svg className="block size-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
          </svg>
          Slackにログイン
        </button>
      </div>
    </div>
  );
};

export default Home;
