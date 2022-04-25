import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FirestoreContext } from "~/components/ContextHandler";
import { useAppState } from "./useAppState";

export interface FirebaseItem {
  deployed: boolean;
  status: string;
  key: string;
}

const listenToFirebase = () => {
  const firestore = useContext(FirestoreContext);

  const { publicKey } = useAppState();

  if (!firestore) return;

  const [data, setData] = useState<DocumentData>();

  console.log(`key changed: ${publicKey}`);

  useEffect(() => {
    console.log(publicKey);

    const fn = (doc: any) => {
      console.log(data);
      setData(doc.data());
    };

    const unsubscribe =
      !!publicKey && onSnapshot(doc(firestore, "users", publicKey), fn);

    return () => {
      !!unsubscribe && unsubscribe();
    };
  }, [publicKey]);

  return [data] as FirebaseItem[];
};

export default listenToFirebase;
