import Dialog from "@reach/dialog";
import "@reach/dialog/styles.css";
import Link from "next/link";
import { ErrorCorrectLevel, QR8BitByte, QRCode } from "qrcode-generator-ts";
import { useEffect, useState } from "react";
import { pub1 } from "~/constants/contracts";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";

const CreateWallet = () => {
  const { setLoading, loading } = useAppState();
  const { add } = useFirestore();
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  function createQRCode(pubKey: string) {
    const qr = new QRCode();

    qr.setTypeNumber(10);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.Q);
    qr.addData(
      new QR8BitByte(`${window.location.href}add-account?pub_key=${pubKey}`)
    );
    qr.make();

    console.log(`${window.location.href}add-account?pub_key=${pubKey}`);

    setQrCode(qr.toDataURL());
  }

  const handleOnCreateWalletClick = async () => {
    try {
      setLoading(true);
      const pubKey = await add(pub1);
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
        <Link href={url}>
          <a>Link</a>
        </Link>
      </Dialog>
    </>
  );
};

export default CreateWallet;
