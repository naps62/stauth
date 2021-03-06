import type { AppProps } from "next/app";
import NextHead from "next/head";
import React from "react";
import ApproveTransactionModal from "~/components/ApproveTransactionModal";
import ContextHandler from "~/components/ContextHandler";
import Header from "~/components/Header";
import Layout from "~/components/Layout";
import getContractsAddresses from "~/hooks/GetContractsAddresses";
import AppStateProvider from "~/hooks/useAppState";
import "~/styles/app.css";
import Counter from "./counter";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [COUNTER_CONTRACT_ADDRESS] = getContractsAddresses();
  const isCounter = Component == Counter;
  const address = isCounter ? COUNTER_CONTRACT_ADDRESS : undefined;
  return (
    <ContextHandler>
      <AppStateProvider>
        <NextHead>
          <title>Stout</title>
        </NextHead>
        <Layout>
          {(!isCounter || address) && (
            <Component {...pageProps} address={address} />
          )}
          <ApproveTransactionModal />
        </Layout>
      </AppStateProvider>
    </ContextHandler>
  );
}
