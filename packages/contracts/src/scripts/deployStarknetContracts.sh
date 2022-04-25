#!/bin/sh

mkdir -p starknet-deployments/$1

# counter=$(npx hardhat starknet-deploy --starknet-network $1 --wait starknet-artifacts/contracts/Counter.cairo/ --inputs "10 5")
# address=$(echo -e "$counter" | grep "Contract address" | awk 'NF{print $NF}')
# echo '{ "address": "'$address'" }' > starknet-deployments/$1/Counter.json

pub1="0x053329e1439fd47b2d7242a5d69ce52eb23d6ee87b22436741cb0a26eee2bedc"
pub2="0x057c631bdb696d9f4ace6d5f20d0dbb0886568780f5c367719d7cbe971d4729d"

multisig=$(npx hardhat starknet-deploy --starknet-network $1 --wait starknet-artifacts/contracts/Multisig.cairo/ --inputs "2 $pub1 $pub2")
address=$(echo -e "$multisig" | grep "Contract address" | awk 'NF{print $NF}')
echo '{ "address": "'$address'" }' > starknet-deployments/$1/Multisig.json

erc20=$(npx hardhat starknet-deploy --starknet-network $1 --wait starknet-artifacts/contracts/StoutERC20.cairo/ --inputs "$ERC_OWNER_ACCOUNT $ERC_OWNER_ACCOUNT")
address=$(echo -e "$erc20" | grep "Contract address" | awk 'NF{print $NF}')
echo '{ "address": "'$address'" }' > starknet-deployments/$1/StoutERC20.json
