import "../styles/globals.css";
import Head from "next/head";
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/img/fav.png" sizes="16x16" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
