import { GetServerSideProps, NextPage } from "next";
import React, { FC, useEffect, useState } from "react";
import useFirestore from "~/hooks/useFirestore";

const AddAccount: FC<{ publicKey: string } & NextPage> = ({ publicKey }) => {
  const [updating, setUpdating] = useState(false);

  const { update } = useFirestore();

  async function updateFromURL() {
    setUpdating(true);

    await update(publicKey);

    setUpdating(false);
  }

  useEffect(() => {
    if (publicKey) {
      updateFromURL();
    }
  }, []);

  return (
    <div>
      <h1>Add account</h1>
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
