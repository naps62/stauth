import Dialog from "@reach/dialog";
import { useContext, useEffect, useState } from "react";
import { ec, hash, InvocationsSignerDetails, Signer } from "starknet";
import { StarknetChainId } from "starknet/constants";
import {
  fromCallsToExecuteCalldataWithNonce,
  transformCallsToMulticallArrays,
} from "starknet/dist/utils/transaction";
import {
  bigNumberishArrayToDecimalStringArray,
  toBN,
  toHex,
} from "starknet/utils/number";
import { MULTISIG_ADDRESS } from "~/constants/contracts";
import listenToFirebase from "~/hooks/listenToFirebse";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";
import { getWalletContract } from "~/utils/multisig";
import { ProviderContext } from "../ContextHandler";
import styles from "./approve-transaction-modal.module.scss";

const ApproveTransactionModal = () => {
  const { isSender, rejectedByValidator, txComplete, setTxComplete } =
    useAppState();
  const [rejected, setRejected] = useState(false);
  const [state, setState] = useState("idle");
  const data = listenToFirebase();
  const provider = useContext(ProviderContext);
  const { setApproval } = useFirestore();
  const [sendTransaction, setSendTransaction] = useState(false);
  useEffect(() => {
    const pubKey =
      localStorage.getItem("publicKey2") || localStorage.getItem("publicKey");

    if (data && data[0]?.calldata && data[0]?.caller !== pubKey) {
      setSendTransaction(true);
    }
  }, [data]);

  const handleOnSignTransactionClick = async () => {
    if (data && data[0].calldata && data[0].caller) {
      const isSecond = !!localStorage.getItem("publicKey2");
      const VERSION = 0;
      const nonce = toBN(data[0].nonce);
      const maxFee = toBN("0");
      const respCalldata = JSON.parse(data[0].calldata);
      const respSignCalldata = JSON.parse(data[0].signedCalldata);

      setState("approving");

      // const calldata = fromCallsToExecuteCalldataWithNonce([respCalldata], maxFee);

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
      const signature = await signer.signTransaction(
        respCalldata,
        signerDetails
      );
      const request = {
        type: "INVOKE_FUNCTION",
        contract_address: MULTISIG_ADDRESS,
        entry_point_selector: hash.getSelectorFromName("__execute__"),
        calldata: respCalldata,
        signature: bigNumberishArrayToDecimalStringArray(
          (isSecond ? signature : respSignCalldata).concat(
            !isSecond ? signature : respSignCalldata
          )
        ),
        max_fee: toHex(maxFee),
      };

      const { callArray, calldata: cd } =
        transformCallsToMulticallArrays(respCalldata);
      console.log(respCalldata);
      const calldata = fromCallsToExecuteCalldataWithNonce(
        respCalldata,
        maxFee
      );

      const { transaction_hash: transferTxHash } = await (
        await getWalletContract()
      ).__execute__(
        callArray,
        cd,
        nonce,
        bigNumberishArrayToDecimalStringArray(
          (isSecond ? signature : respSignCalldata).concat(
            !isSecond ? signature : respSignCalldata
          )
        )
      );

      await provider.waitForTransaction(transferTxHash);

      setState("done");
      setApproval(true);

      /* const result = await fetch("https://alpha4.starknet.io/gateway/add_transaction", {
        method: "POST",
        body: JSON.stringify(request),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });
      console.log(await result.json()); */
      //await provider.waitForTransaction((await result.json())!.data.transaction_hash);
    }
  };

  function handleReject() {
    setApproval(false);
    setRejected(true);
  }

  if (txComplete) {
    return <p>Done!</p>;
  }

  if (isSender) {
    return (
      <Dialog>
        <p>Waiting for approval...</p>
      </Dialog>
    );
  }

  if (rejected) {
    return <p>You rejected this transaction</p>;
  }

  if (rejectedByValidator) {
    return <p>Transaction rejected!</p>;
  }

  return (
    <Dialog
      isOpen={sendTransaction}
      aria-label="Process transaction"
      onDismiss={() => setSendTransaction(false)}
    >
      <div className={styles.wrapper}>
        {state === "approving" && <p>Executing transaction...</p>}
        {state === "done" && <p>Done!</p>}
        {state === "idle" && (
          <>
            <h3>Sign transaction:</h3>
            <pre className={styles.transactionSnippet}>
              {data && data[0]?.calldata
                ? JSON.stringify(
                    JSON.parse((data && data[0]?.calldata) as string),
                    null,
                    2
                  )
                : ""}
            </pre>
            <div className={styles.actions}>
              <button onClick={handleOnSignTransactionClick}>Approve</button>
              <button onClick={handleReject}>Reject</button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default ApproveTransactionModal;
