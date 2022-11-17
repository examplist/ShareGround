import Head from 'next/head';
import Welcome from 'components/Welcome';
import Intro from 'components/Intro';
import style from 'styles/pages/index.module.scss';

export default function Home() {
  return (
    <>
      <Head>
        <title>Shareground-Home</title>
      </Head>
      <main className={style.home}>
        <Welcome />
        <Intro />
      </main>
    </>
  );
}
