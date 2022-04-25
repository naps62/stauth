import compiledErc20 from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/EthereumERC20.cairo/EthereumERC20_abi.json';
import { Abi, Contract } from "starknet";
import { ERC20_ADDRESS } from '~/constants/contracts';

export const getErc20Contract = () => {
  return new Contract(compiledErc20 as Abi, ERC20_ADDRESS as string);
};
