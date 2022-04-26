import Dialog from "@reach/dialog";
import Styles from "./createWallet.module.scss";
import "@reach/dialog/styles.css";
import Link from "next/link";
import { ErrorCorrectLevel, QR8BitByte, QRCode } from "qrcode-generator-ts";
import { useEffect, useState } from "react";
import { useAppState } from "~/hooks/useAppState";
import useFirestore from "~/hooks/useFirestore";

const CreateWallet = () => {
  const { setLoading, loading , linked} = useAppState();
  const { add } = useFirestore();
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [message, setMessage] = useState("");

  function createQRCode(pubKey: string) {
    const qr = new QRCode();

    qr.setTypeNumber(15);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.Q);
    qr.addData(
      new QR8BitByte(`${window.location.href}add-account?pub_key=${pubKey}`)
    );
    qr.make();

    setQrCode(qr.toDataURL());
  }

  const handleOnCreateWalletClick = async () => {
    try {
      setLoading(true);
      setMessage("Waiting to be linked...")
      const pubKey = await add();
      createQRCode(pubKey as string);
      setUrl(`${window.location.href}add-account?pub_key=${pubKey}`);
      setShowModal(true);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    if (linked) {
      setMessage("You're linked!")

      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    }
  }, [linked]);

  return (
    <>
      <button onClick={handleOnCreateWalletClick}>Create new wallet</button>
      <div className={Styles.wrapper}>
        <Dialog
          className={Styles.modalContent}
          aria-label="Scan this QR Code"
          style={{ color: "red" }}
          isOpen={showModal}
          onDismiss={() => setShowModal(false)}
        >
          <p className={Styles.message}>{message}</p>
          <img src={qrCode} className={Styles.img} />
          <Link href={url} passHref>
            <a target="_blank">Open link</a>
          </Link>
        </Dialog>
      </div>
    </>
  );
};

export default CreateWallet;
