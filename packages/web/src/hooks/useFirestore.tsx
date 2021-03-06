import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useContext } from "react";
import { FirestoreContext } from "~/components/ContextHandler";
import { priv1, priv2, pub1, pub2 } from "~/constants/contracts";
import { useAppState } from "./useAppState";

export default function useFirestore() {
  const firestore = useContext(FirestoreContext);
  const { setKeys } = useAppState();

  function generateKeys(isPrimaryKey: boolean = true) {
    /* const keyPair = ec.genKeyPair();
    const keyPub = ec.getStarkKey(keyPair); */

    const keyPair = isPrimaryKey ? priv2 : priv1;
    const keyPub = isPrimaryKey ? pub2 : pub1;

    return { keyPair, keyPub };
  }

  async function add(primaryKey?: string) {
    const { keyPub, keyPair } = generateKeys(!!primaryKey);

    try {
      await setDoc(doc(firestore, "users", primaryKey ? primaryKey : keyPub), {
        key: primaryKey ? keyPub : "",
        calldata: "",
        signedCalldata: "",
        status: "pending",
        deployed: false,
      });

      setKeys(primaryKey ? primaryKey : keyPub, keyPair);

      if (primaryKey) {
        localStorage.setItem("publicKey2", keyPub);
      }

      return keyPub;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function setDeployed(primaryKey?: string) {
    const { keyPub } = generateKeys(!!primaryKey);

    try {
      await updateDoc(doc(firestore, "users", primaryKey || keyPub), {
        key: primaryKey || keyPub,
        status: "idle",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function update(data: any) {
    const pubKey = localStorage.getItem("publicKey");
    try {
      await updateDoc(doc(firestore, "users", pubKey as string), {
        ...data,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  async function setApproval(approved?: boolean) {
    const pubKey = localStorage.getItem("publicKey");
    try {
      await updateDoc(doc(firestore, "users", pubKey as string), {
        status: approved ? "done" : "rejected",
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  async function deploy() {
    const pubKey = localStorage.getItem("publicKey");
    try {
      await updateDoc(doc(firestore, "users", pubKey as string), {
        deployed: true,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  async function setLinked(data: any) {
    const pubKey = localStorage.getItem("publicKey");
    try {
      await updateDoc(doc(firestore, "users", pubKey as string), {
        linked: true,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  return {
    add,
    setDeployed,
    update,
    setApproval,
    deploy,
    setLinked,
  };
}
