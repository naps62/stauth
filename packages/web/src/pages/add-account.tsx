import { GetServerSideProps, NextPage } from "next";
import React, { FC } from "react";
import AddAccount from "~/components/AddAccount";

const AddAccountPage: FC<{ publicKey: string } & NextPage> = ({
  publicKey,
}) => {
  return <AddAccount publicKey={publicKey} />;
};

export default AddAccountPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const publicKey = ctx.query?.pub_key || "";

  return {
    props: {
      publicKey,
    },
  };
};
