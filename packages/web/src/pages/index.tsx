import "@reach/dialog/styles.css";
import type { NextPage } from "next";
import { FC } from "react";
import { ec, InvocationsSignerDetails, Signer } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { Call } from "starknet/types";
import { toBN } from "starknet/utils/number";
import { ERC20_ADDRESS, MULTISIG_ADDRESS } from "~/constants/contracts";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";

type Props = {};

const Home: FC<Props & NextPage> = () => {
  const { loading } = useAppState();
  const { update } = useFirestore();
  const handleOnMintClick = async () => {
    const calls = [
      {
        contractAddress: ERC20_ADDRESS,
        entrypoint: "mint",
        calldata: [MULTISIG_ADDRESS, toBN(20), toBN(20) /*for some strange reason we need this last param :S*/],
      },
    ] as Call[];

    const VERSION = 0;

    const nonce = toBN(0);
    const maxFee = toBN("0");

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: MULTISIG_ADDRESS,
      nonce,
      maxFee,
      version: toBN(VERSION),
      chainId: StarknetChainId.TESTNET,
    };

    const signer = new Signer(
      ec.getKeyPair(localStorage.getItem("privateKey") as string)
    );
    const signature = await signer.signTransaction(calls, signerDetails);
    update({
      calldata: JSON.stringify(calls),
      signedCalldata: JSON.stringify(signature),
      caller: localStorage.getItem("publicKey"),
      status: "pending",
    });
  };

  return (
    <section>
      <h1>Stout tokens</h1>
      <button onClick={handleOnMintClick}>Mint Stout token</button>
    </section>
  );
};

export default Home;
