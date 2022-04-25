import Dialog from "@reach/dialog";
import "@reach/dialog/styles.css";
import { ErrorCorrectLevel, QR8BitByte, QRCode } from "qrcode-generator-ts";
import { useState } from "react";
import useFirestore from "~/hooks/useFirestore";

const CreateWallet = () => {
  const { add } = useFirestore();

  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  function createQRCode(pubKey: string) {
    const qr = new QRCode();
    
    qr.setTypeNumber(10);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.Q);
    qr.addData(
      new QR8BitByte(`${window.location.href}add-account?pub_key=${pubKey}`)
    );
    qr.make();

    setQrCode(qr.toDataURL());
  }

  const handleOnCreateWalletClick = async () => {
    try {
      const pubKey = await add();      
      createQRCode(pubKey as string);
      setShowModal(true);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <>
      <button onClick={handleOnCreateWalletClick}>Create new wallet</button>
      <Dialog
        aria-label="Scan this QR Code"
        style={{ color: "red" }}
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
      >
        <img src={qrCode} />
      </Dialog>
    </>
  );
};

export default CreateWallet;
