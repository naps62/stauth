import Link from "next/link";
import { useEffect, useState } from "react";
import CreateWallet from "~/components/CreateWallet";
import listenToFirebase from "~/hooks/listenToFirebse";
import styles from "./header.module.scss";

const Header = () => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const data = listenToFirebase();
  useEffect(() => {
    setPrivateKey(localStorage.getItem("privateKey"));
  }, [data]);
  return (
    <section className={styles.header}>
      <h1 className={styles.logo}>STOUT</h1>
      <div className={styles.logo}></div>
      <div className={styles.actions}>
        <CreateWallet />
        {!data ||
          (data && !data[0]?.key && (
            <Link href="/add-account">
              <button>Add Signature</button>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default Header;
