import "@reach/dialog/styles.css";
import type { NextPage } from 'next';
import { FC } from 'react';

type Props = {}

const Home: FC<Props & NextPage> = () => {
  return (
    <section className="simple-container">
      <h1>Stout</h1>
    </section>
  )
}

export default Home
