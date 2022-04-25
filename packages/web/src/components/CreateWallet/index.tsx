import Dialog from "@reach/dialog";
import "@reach/dialog/styles.css";
import { doc, setDoc } from "firebase/firestore";
import { ErrorCorrectLevel, QR8BitByte, QRCode } from 'qrcode-generator-ts';
import { useContext, useState } from 'react';
import { ec } from 'starknet';
import { FirestoreContext } from '~/components/ContextHandler';

const CreateWallet = () => {
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
    <>
      <button onClick={handleOnCreateWalletClick}>Create new wallet</button>
      <Dialog style={{ color: "red" }} isOpen={showModal} onDismiss={() => setShowModal(false)}>
        <img src={qrCode} />
      </Dialog>
    </>
  );
};

export default CreateWallet;
