import { doc, onSnapshot } from "firebase/firestore";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { FirestoreContext } from "~/components/ContextHandler";
import { FirebaseItem } from "./listenToFirebse";

interface AppState {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  privateKey: string;
  store: FirebaseItem[] | undefined;
  publicKey: string;
  setKeys: (publicKey: string, privateKey: string) => void;
  isSender: boolean;
  setIsSender: Dispatch<SetStateAction<boolean>>;
  rejectedByValidator: boolean;
  setRejectedByValidator: Dispatch<SetStateAction<boolean>>;
  txComplete: boolean;
  linked: boolean;
  setTxComplete: Dispatch<SetStateAction<boolean>>;
}

export const AppStateContext = createContext({} as AppState);

export default function AppStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [rejectedByValidator, setRejectedByValidator] = useState(false);
  const [isSender, setIsSender] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [txComplete, setTxComplete] = useState(false);
  const [store, setStore] = useState<FirebaseItem[]>([]);
  const [linked, setLinked] = useState(false);

  const firestore = useContext(FirestoreContext);

  useEffect(() => {
    const value = store?.[0];

    if (!value) return;
    if (loading && value?.status === "idle") {
      setLoading(false);
    }

    if (loading && value?.key) {
      setLoading(false);
    }

    if (value?.status === "rejected") {
      setRejectedByValidator(true);
    }

    if (value?.linked) {
      setLinked(true);
    }

    if (value?.status === "done") {
      setTxComplete(true);
    }
  }, [store, publicKey]);

  useEffect(() => {
    const fn = (doc: any) => {
      console.log(doc.data());
      setStore([doc.data()]);
    };

    const unsubscribe =
      !!publicKey && onSnapshot(doc(firestore, "users", publicKey), fn);

    return () => {
      !!unsubscribe && unsubscribe();
    };
  }, [publicKey]);

  useEffect(() => {
    setPrivateKey(localStorage.getItem("privateKey") || "");
    setPublicKey(localStorage.getItem("publicKey") || "");
  }, []);

  function setKeys(publicKey: string, privateKey: string) {
    localStorage.setItem("publicKey", publicKey);
    localStorage.setItem("privateKey", privateKey);
    setPublicKey(publicKey);
    setPrivateKey(privateKey);
  }

  return (
    <AppStateContext.Provider
      value={{
        loading,
        setLoading,
        privateKey,
        publicKey,
        setKeys,
        store,
        setIsSender,
        isSender,
        rejectedByValidator,
        setRejectedByValidator,
        txComplete,
        setTxComplete,
        linked,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const state = useContext(AppStateContext);

  return state;
}
