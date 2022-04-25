import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import React from 'react';
import getContractsAddresses from '~/hooks/GetContractsAddresses';
import '~/styles/app.css';
import Counter from './counter';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [COUNTER_CONTRACT_ADDRESS] = getContractsAddresses();
  const isCounter = Component == Counter;
  const address = isCounter ? COUNTER_CONTRACT_ADDRESS : undefined;
  return (
    <>
      <NextHead>
          <title>Stout</title>
      </NextHead>
      {(!isCounter || address) &&
        <Component {...pageProps} address={address} />
      }
    </>
  )
}
