import { GetServerSideProps, NextPage } from "next";
import React, { FC, useContext, useState } from "react";
import { ProviderContext } from "~/components/ContextHandler";
import { pub1 } from "~/constants/contracts";
import useFirestore from "~/hooks/useFirestore";

const AddAccount: FC<{ publicKey: string } & NextPage> = ({ publicKey }) => {
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
    setState("done");

  }

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
      <button
        type="button"
        onClick={() => {
          setDeployed(pub1);
        }}
      >
        Done
      </button>
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
