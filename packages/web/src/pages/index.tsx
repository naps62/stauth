import type { NextPage } from 'next';
import Link from 'next/link';
import { FC } from 'react';
import getContractsAddresses from '~/hooks/GetContractsAddresses';

type Props = {}

const Home: FC<Props & NextPage> = () => {
  const [COUNTER_CONTRACT_ADDRESS] = getContractsAddresses();
  console.log(COUNTER_CONTRACT_ADDRESS);

  return (
    <section className="simple-container">
      <h1>Starknet bootcamp :D</h1>
      <div key="counter">
        <h4>
          #1 Exercise
        </h4>
        {COUNTER_CONTRACT_ADDRESS ? (
          <Link key="counterButton" href="/counter">
            <a>Counter</a>
          </Link>
        ) : (
          <p>After deploying the Counter contract in your local node make sure you past the address to <strong>constants/contracts.ts</strong></p>
        )}
      </div>
    </section>
  )
}

export default Home
