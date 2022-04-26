import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "~/components/ContextHandler";
import { useAppState } from "./useAppState";

export interface FirebaseItem {
  nonce: number;
  signedCalldata: string;
  deployed: boolean;
  status: string;
  key: string;
  calldata: string;
  caller: string;
}

const listenToFirebase = () => {
  const firestore = useContext(FirestoreContext);
  
  const { publicKey } = useAppState();

  if (!firestore) return;

  const [data, setData] = useState<DocumentData>();

  useEffect(() => {

    const fn = (doc: any) => {
      setData(doc.data());
    };

    const unsubscribe =
      !!publicKey && onSnapshot(doc(firestore, "users", publicKey), fn);

    return () => {
      !!unsubscribe && unsubscribe();
    };
  }, [publicKey, setData]);
  return [data] as FirebaseItem[];
};

export default listenToFirebase;
