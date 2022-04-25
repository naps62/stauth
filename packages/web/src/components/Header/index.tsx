import Link from 'next/link';
import { useEffect, useState } from 'react';
import CreateWallet from '~/components/CreateWallet';
import styles from './header.module.scss';

const Header = () => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  useEffect(() => {
    setPrivateKey(localStorage.getItem('privateKey'));
  });
  return (
    <section className={`simple-container ${styles.header}`}>
      <div className={styles.logo}></div>
      <div className={styles.actions}>
        {!privateKey &&
          <CreateWallet />
        }
        <Link href="/add-account">
          <button>Add Signature</button>
        </Link>
      </div>
    </section>
  );
};

export default Header;
