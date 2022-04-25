import "@reach/dialog/styles.css";
import type { NextPage } from 'next';
import { FC, useEffect } from 'react';
import {
  toBN
} from "starknet/utils/number";
import { getErc20Contract } from "~/utils/erc20";

type Props = {}

const Home: FC<Props & NextPage> = () => {
  const erc20 = getErc20Contract();
  useEffect(() => {
    (async () => {
      const res = await erc20.call('totalSupply');
      const num = toBN(res.res, 16).toString()
      console.log(num);
    })();
  });
  return (
    <section className="simple-container">
      <h1>Stout</h1>
    </section>
  )
}

export default Home
