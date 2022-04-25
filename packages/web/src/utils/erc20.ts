import compiledErc20 from '@starknet-bootcamp/contracts/starknet-artifacts/contracts/StoutERC20.cairo/StoutERC20_abi.json';
import { Abi, Contract } from "starknet";
import { ERC20_ADDRESS } from '~/constants/contracts';

export const getErc20Contract = () => {
  return new Contract(compiledErc20 as Abi, ERC20_ADDRESS as string);
};
