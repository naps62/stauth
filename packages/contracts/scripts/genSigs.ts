import { starknet } from "hardhat";
import { ec } from "starknet";

const main = async () => {
  const kp1 = ec.genKeyPair();
  const kp2 = ec.genKeyPair();
  const pub1 = ec.getStarkKey(kp1);
  const pub2 = ec.getStarkKey(kp2);

  // const multisigFactory = await starknet.getContractFactory("Counter");

  // const multisig = multisigFactory.deploy({ _n: 2, pk1: pub1, pk2: pub2 });

  console.log("PK 1:");
  console.log(`pub: ${pub1}`);
  console.log(`priv: ${kp1.getPrivate()}`);

  console.log("PK 2:");
  console.log(`pub: ${pub2}`);
  console.log(`priv: ${kp2.getPrivate()}`);

  // console.log(`Multisig: ${multisig.address}`);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
