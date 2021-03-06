import "@reach/dialog/styles.css";
import type { NextPage } from "next";
import { FC, useEffect, useState } from "react";
import { ec, InvocationsSignerDetails, Signer } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { bnToUint256, Uint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { Call } from "starknet/types";
import { toBN } from "starknet/utils/number";
import { ERC20_ADDRESS, MULTISIG_ADDRESS } from "~/constants/contracts";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";
import { getErc20Contract } from "~/utils/erc20";
import { getWalletContract } from "~/utils/multisig";

type Props = {};

const Home: FC<Props & NextPage> = () => {
  const { loading } = useAppState();
  const { update } = useFirestore();
  const [balance, setBalance] = useState("0");
  const { setIsSender } = useAppState();

  useEffect(() => {
    const fn = async () => {
      const bln = await getErc20Contract().call("balanceOf", [
        MULTISIG_ADDRESS,
      ]);
      setBalance(uint256ToBN(bln[0] as Uint256).toString());
    };
    fn();
  }, []);

  const handleOnMintClick = async () => {
    setIsSender(true);

    const amount = bnToUint256("1000000000000000000");
    const calls = [
      {
        contractAddress: ERC20_ADDRESS,
        entrypoint: "mint",
        calldata: [
          MULTISIG_ADDRESS,
          amount.low.toString(),
          amount.high.toString() /*for some strange reason we need this last param :S*/,
        ],
      },
    ] as Call[];

    const VERSION = 0;
    const nonce = (
      await (await getWalletContract()).call("nonce", [])
    )[0].toString();

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
      nonce: parseInt(nonce.toString(), 10),
    });
    // localStorage.setItem('nonce', `${parseInt(nonce.toString(), 10) + 1}`)
  };

  return (
    <section>
      <h1>Stout tokens</h1>      
      balance: {balance}
      <br />
      <button onClick={handleOnMintClick}>Mint Stout token</button>
    </section>
  );
};

export default Home;
