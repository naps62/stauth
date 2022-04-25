import Dialog from "@reach/dialog";
import "@reach/dialog/styles.css";
import { doc, setDoc } from "firebase/firestore";
import type { NextPage } from 'next';
import { ErrorCorrectLevel, QR8BitByte, QRCode } from 'qrcode-generator-ts';
import { FC, useContext, useState } from 'react';
import { ec } from 'starknet';
import { FirestoreContext } from '~/components/ContextHandler';

type Props = {}

const Home: FC<Props & NextPage> = () => {
  const firestore = useContext(FirestoreContext);
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');

  const handleOnCreateWalletClick = async () => {
    const keyPair = ec.genKeyPair();
    const keyPub = ec.getStarkKey(keyPair);
    try {
      await setDoc(doc(firestore, "users", keyPub), {
        key: '',
        calldata: ''
      });
      localStorage.setItem('publicKey', keyPub);
      localStorage.setItem('privateKey', keyPair);
      const qr = new QRCode();
      qr.setTypeNumber(10);
      qr.setErrorCorrectLevel(ErrorCorrectLevel.Q);
      console.log(keyPub);
      qr.addData(new QR8BitByte(`${window.location.href}add-account?pub_key=${keyPub}`));
      qr.make();
      setQrCode(qr.toDataURL());
      setShowModal(true);
      console.log("Document written with");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  return (
    <section className="simple-container">
      <h1>Stout</h1>
      <button onClick={handleOnCreateWalletClick}>Create new wallet</button>
      <Dialog style={{ color: "red" }} isOpen={showModal} onDismiss={() => setShowModal(false)}>
        <img src={qrCode} />
      </Dialog>
    </section>
  )
}

export default Home
