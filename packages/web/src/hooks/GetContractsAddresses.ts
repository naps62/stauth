import { useCallback, useEffect, useState } from 'react';

const getContractsAddresses = () => {
  const network = 'devnet';
  const [counterAddress, setCounterAddress] = useState<string>();
  
  const loadCounterAddress = useCallback(async () => {
    try {
      const counter = await import(`@starknet-bootcamp/contracts/starknet-deployments/${network}/Counter.json`);
      setCounterAddress(counter.address);
    } catch (e) {
      console.log(e);
    }
  }, [setCounterAddress, network]);
  
  useEffect(() => {
    loadCounterAddress();
  }, [loadCounterAddress]);
  return [counterAddress] as const;
}

export default getContractsAddresses;
