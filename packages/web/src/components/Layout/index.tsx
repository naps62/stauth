import React from "react";
import Header from "../Header";
import Styles from "./index.module.scss";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={Styles.wrapper}>
      <Header />
      {children}
    </div>
  );
}
