import "@reach/dialog/styles.css";
import type { NextPage } from 'next';
import { FC } from 'react';
import { ec, InvocationsSignerDetails, Signer } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { Call } from "starknet/types";
import {
  toBN
} from "starknet/utils/number";
import { fromCallsToExecuteCalldataWithNonce } from "starknet/utils/transaction";
import { ERC20_ADDRESS, MULTISIG_ADDRESS } from "~/constants/contracts";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";


type Props = {}

const Home: FC<Props & NextPage> = () => {
  const { loading } = useAppState();
  const { update } = useFirestore();
  const handleOnMintClick = async () => {
    const calls = [
      {
        contractAddress: ERC20_ADDRESS,
        entrypoint: "mint",
        calldata: [MULTISIG_ADDRESS, 20],
      },
    ] as Call[];
    
    const VERSION = 0;

    const nonce = 0;
    const maxFee = toBN("0");
    const calldata = fromCallsToExecuteCalldataWithNonce(calls, maxFee);

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: MULTISIG_ADDRESS,
      nonce,
      maxFee,
      version: toBN(VERSION),
      chainId: StarknetChainId.TESTNET,
    };

    const signer = new Signer(ec.getKeyPair(localStorage.getItem('privateKey') as string));
    console.log(signer);
    const signature = await signer.signTransaction(calls, signerDetails);
    update({
      calldata,
      signCalldata: signature,
      caller: localStorage.getItem('publicKey'),
      status: 'pending'
    });
  };

  return (
    <section className="simple-container">
      <h1>Stout</h1>
      {loading && "Pending stuff"}
      <button onClick={handleOnMintClick}>Mint Ethereum token</button>
    </section>
  )
}

export default Home
