import { useEffect } from "react"
import listenToFirebase from "~/hooks/listenToFirebse"

const ApproveTransactionModal = () => {
    const data = listenToFirebase();
    useEffect(() => {
      /* const pubKey = localStorage.getItem('')
      if (data.calldata && data.caller === ) {

      } */
    }, [data]);
  return (<></>);
};

export default ApproveTransactionModal;
