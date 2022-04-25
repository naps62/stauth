import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { FirestoreContext } from '~/components/ContextHandler';

const listenToFirebase = () => {
  const firestore = useContext(FirestoreContext);
  const [data, setData] = useState<DocumentData>();
  useEffect(() => {
    const pubKey = localStorage.getItem('publicKey') as string;
    const unsubscribe = !!pubKey && onSnapshot(doc(firestore, "users", pubKey), (doc) => {
      setData(doc.data());
    });
    return () => {
      !!unsubscribe && unsubscribe();
    };
  }, []);
  return [data] as const;
}

export default listenToFirebase;
