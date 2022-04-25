import { GetServerSideProps, NextPage } from "next";
import React, { FC, useContext, useEffect, useState } from "react";
import { ProviderContext } from "~/components/ContextHandler";
import useFirestore from "~/hooks/useFirestore";
import { deployWallet } from "~/utils/multisig";

const AddAccount: FC<{ publicKey: string } & NextPage> = ({ publicKey }) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const provider = useContext(ProviderContext);

  const { update, add } = useFirestore();

  async function updateDoc(firstKey: string, secondKey?: string) {
    await update(firstKey, secondKey);
  }
  
  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const secondKey = await add(event.currentTarget["key"]?.value);
    const firstKey = localStorage.getItem("publicKey") as string;
    
    await updateDoc(firstKey, secondKey);
    await deployWallet(provider, [firstKey, secondKey as string]);
    setState("done");
  }

  useEffect(() => {
    if (publicKey) {
      updateDoc(publicKey);
    }
  }, []);

  return (
    <div>
      <h1>Add account</h1>
      {state === "loading" && (
        <p>Linking you to {publicKey.substring(0, 10)}...</p>
      )}
      {state === "done" && <p>You're all set!</p>}
      {state === "idle" && (
        <form onSubmit={handleFormSubmit}>
          <label>
            The public key you want to link
            <input type="text" name="key" />
          </label>
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
};

export default AddAccount;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const publicKey = ctx.query?.pub_key || "";

  return {
    props: {
      publicKey,
    },
  };
};
