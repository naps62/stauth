// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { createContext, FC, ReactNode } from 'react';
import { defaultProvider, Provider } from 'starknet';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0u2l0jRWPhuSXp7ni7q_pTg7dqxnS0kU",
  authDomain: "stout-efefe.firebaseapp.com",
  projectId: "stout-efefe",
  storageBucket: "stout-efefe.appspot.com",
  messagingSenderId: "248783523379",
  appId: "1:248783523379:web:f51eccbaa1c3beff1fdd46",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const firestore = getFirestore();

export const ProviderContext = createContext<Provider>(
  null as unknown as Provider
);
export const FirestoreContext = createContext<Firestore>(
  null as unknown as Firestore
);
export const StateContext = createContext({
  loading: false,
});

const state = {
  loading: false,
};

interface Props {
  children: ReactNode;
}

const starknetProvider = defaultProvider;
/* const starknetProvider = new Provider({
  baseUrl: 'https://hackathon-2.starknet.io'
}); */

const ContextHandler: FC<Props> = ({ children }) => {
  return (
    <StateContext.Provider value={state}>
      <FirestoreContext.Provider value={firestore}>
        <ProviderContext.Provider value={starknetProvider}>
          {children}
        </ProviderContext.Provider>
      </FirestoreContext.Provider>
    </StateContext.Provider>
  );
};
export default ContextHandler;
