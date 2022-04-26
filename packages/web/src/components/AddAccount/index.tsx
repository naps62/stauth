import React, { FC, useContext, useState } from "react";
import { ProviderContext } from "~/components/ContextHandler";
import { pub1 } from "~/constants/contracts";
import useFirestore from "~/hooks/useFirestore";
import { deployWallet } from "~/utils/multisig";
import Styles from "./index.module.scss";

export default function AddAccount({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const provider = useContext(ProviderContext);

  const { add, setDeployed } = useFirestore();

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    add(pub1);
    // const secondKey = await add(event.currentTarget["key"]?.value);
    // const firstKey = localStorage.getItem("publicKey") as string;
    // await deployWallet(provider, [firstKey, secondKey as string]);
    const secondKey =
      "0x053329e1439fd47b2d7242a5d69ce52eb23d6ee87b22436741cb0a26eee2bedc"; //await add(event.currentTarget["key"]?.value);
    const firstKey =
      "0x057c631bdb696d9f4ace6d5f20d0dbb0886568780f5c367719d7cbe971d4729d"; //localStorage.getItem("publicKey") as string;

    const result = await deployWallet(provider, [
      firstKey,
      secondKey as string,
    ]);
    setState("done");
  }

  return (
    <div>
      {state === "loading" && (
        <p>Linking you to {publicKey.substring(0, 10)}...</p>
      )}
      {state === "done" && <p>You're all set!</p>}
      {state === "idle" && (
        <form onSubmit={handleFormSubmit} className={Styles.form}>
          <h1>Add account</h1>
          <label>
            The public key you want to link
            <input
              type="text"
              name="key"
              defaultValue={publicKey}
              disabled={!!publicKey}
            />
          </label>
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
}
