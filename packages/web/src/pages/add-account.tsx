import { GetServerSideProps, NextPage } from "next";
import React, { FC, useEffect, useState } from "react";
import useFirestore from "~/hooks/useFirestore";

const AddAccount: FC<{ publicKey: string } & NextPage> = ({ publicKey }) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const { update } = useFirestore();

  async function updateDoc(firstKey: string, secondKey?: string) {
    setState("loading");

    await update(firstKey, secondKey);

    setState("done");
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstKey = localStorage.getItem("publicKey") as string;
    const secondKey = event.currentTarget["key"]?.value;

    await updateDoc(firstKey, secondKey);
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
