import compiledErc20 from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/EthereumERC20.cairo/EthereumERC20_abi.json';
import { Abi, Contract } from "starknet";

const erc20Address = '0x06eb0e531e13ebe7483a9b76a7cd37989e1fe5542f6568c52c76f3bc2a800c2c';

export const getErc20Contract = () => {
  return new Contract(compiledErc20 as Abi, erc20Address as string);
  throw new Error('The erc20 is not deployed');
};