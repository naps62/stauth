import { doc, onSnapshot } from "firebase/firestore";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState
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
}

export const AppStateContext = createContext({} as AppState);

export default function AppStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [store, setStore] = useState<FirebaseItem[]>([]);

  const firestore = useContext(FirestoreContext);

  useEffect(() => {
    const value = store?.[0];

    if (!value) return;
    if (loading && value?.status === "idle") {
      setLoading(false);
    }
  }, [store, publicKey]);

  useEffect(() => {
    const fn = (doc: any) => {
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
