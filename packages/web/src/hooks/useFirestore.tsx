import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useContext } from "react";
import { ec } from "starknet";
import { FirestoreContext } from "~/components/ContextHandler";

export default function useFirestore() {
  const firestore = useContext(FirestoreContext);

  function generateKeys() {
    const keyPair = ec.genKeyPair();
    const keyPub = ec.getStarkKey(keyPair);

    return { keyPair, keyPub };
  }

  async function add() {
    const { keyPub } = generateKeys();

    try {
      await setDoc(doc(firestore, "users", keyPub), {
        key: "",
        calldata: "",
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function update(firstKey: string, secondKey?: string) {
    const targetDoc = doc(firestore, "users", firstKey);
    const associatedKey = secondKey || generateKeys().keyPub;

    try {
      await updateDoc(targetDoc, {
        key: associatedKey,
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }

  return {
    add,
    update,
  };
}
