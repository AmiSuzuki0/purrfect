import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta charSet="UTF-8" />
          <link rel="icon" href="/favicon.ico" />
          <meta property="og:title" content="Purrfect" key="ogtitle" />
          <meta property="og:description" content="Purrfectはslackの特定チャンネルをタイムラインで表示するサービスです" key="ogdesc" />
          <meta property="og:image" content="https://purrfect-opal.vercel.app/ogp_medium.png" key="ogimage" />
          <meta property="og:url" content="https://purrfect-opal.vercel.app/" key="ogurl" />
          <meta property="og:type" content="website" key="ogtype" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
