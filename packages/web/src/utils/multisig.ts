import compiledMultisig from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/Multisig.cairo/Multisig.json';
import { Abi, CompiledContract, Contract, Provider } from "starknet";
import {
  toBN
} from "starknet/utils/number";
import { MULTISIG_ADDRESS } from '~/constants/contracts';

export const deployWallet = async (provider: Provider, pubKeys: string[]) => {
  const firstKey = pubKeys[0];
  const secKey = pubKeys[1];
  const num = toBN(2);
  const wallet = await provider.deployContract({
    contract: compiledMultisig as CompiledContract,
    constructorCalldata: [num, firstKey, secKey]
  });
  await provider.waitForTransaction(wallet.transaction_hash);
  const walletAddress = wallet.address;
  localStorage.setItem('walletAddress', walletAddress as string);
  return wallet.address;
}

export const getWalletContract = () => {
  const walletAddress = MULTISIG_ADDRESS;
  if (walletAddress) {
    return new Contract(compiledMultisig.abi as Abi, walletAddress as string);
  }
  throw new Error('The wallet is not deployed');
};
