import Link from 'next/link';
import { useEffect, useState } from 'react';
import CreateWallet from '~/components/CreateWallet';
import listenToFirebase from '~/hooks/listenToFirebse';
import styles from './header.module.scss';

const Header = () => {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const data = listenToFirebase();
  useEffect(() => {
    setPrivateKey(localStorage.getItem('privateKey'));
  }, []);
  return (
    <section className={`simple-container ${styles.header}`}>
      <div className={styles.logo}></div>
      <div className={styles.actions}>
        {!privateKey &&
          <CreateWallet />
        }
        {!data || (data && !data[0]?.key) &&
          <Link href="/add-account">
            <button>Add Signature</button>
          </Link>
        }
      </div>
    </section>
  );
};

export default Header;
