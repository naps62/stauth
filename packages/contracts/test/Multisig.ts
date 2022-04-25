import { starknet } from "hardhat";
import {
  hash,
  ec,
  Contract,
  Abi,
  Provider,
  Signer,
  InvocationsSignerDetails,
} from "starknet";
import { StarknetChainId } from "starknet/constants";
import { stringify } from "starknet/dist/utils/json";
import {
  bigNumberishArrayToDecimalStringArray,
  toBN,
  toHex,
} from "starknet/utils/number";
import { expect } from "chai";
import { StarknetContract } from "hardhat/types";
import { fromCallsToExecuteCalldataWithNonce } from "starknet/utils/transaction";
import axios from "axios";

import MultisigABI from "../starknet-artifacts/contracts/Multisig.cairo/Multisig_abi.json";

const kp1 = ec.genKeyPair();
const kp2 = ec.genKeyPair();
const pub1 = ec.getStarkKey(kp1);
const pub2 = ec.getStarkKey(kp2);
const signer1 = new Signer(kp1);
const signer2 = new Signer(kp2);

describe("Multisig", function () {
  this.timeout(30_000);

  let counter: StarknetContract;
  let multisig: StarknetContract;
  let multisigContract: Contract;
  let provider: Provider;

  beforeEach(async () => {
    const counterFactory = await starknet.getContractFactory("Counter");
    counter = await counterFactory.deploy({ initial: 0n, max: 10n });

    const multisigFactory = await starknet.getContractFactory("Multisig");
    multisig = await multisigFactory.deploy({ _n: 2, pk1: pub1, pk2: pub2 });

    provider = new Provider({
      baseUrl: "http://localhost:5000",
      feederGatewayUrl: "http://localhost:5000",
      gatewayUrl: "http://localhost:5000",
    });

    multisigContract = new Contract(
      MultisigABI as unknown as Abi,
      multisig.address,
      provider
    );
  });

  it.only("works", async () => {
    const calls = [
      {
        contractAddress: counter.address,
        entrypoint: "increment_one",
        calldata: [],
      },
      {
        contractAddress: counter.address,
        entrypoint: "increment_one",
        calldata: [],
      },
    ];

    const VERSION = 0;

    const nonce = 0;
    const maxFee = toBN("0");
    const calldata = fromCallsToExecuteCalldataWithNonce(calls, maxFee);

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: multisig.address,
      nonce,
      maxFee,
      version: toBN(VERSION),
      chainId: StarknetChainId.TESTNET,
    };

    const signature1 = await signer1.signTransaction(calls, signerDetails);
    const signature2 = await signer2.signTransaction(calls, signerDetails);

    const request = {
      type: "INVOKE_FUNCTION",
      contract_address: multisig.address,
      entry_point_selector: hash.getSelectorFromName("__execute__"),
      calldata,
      signature: bigNumberishArrayToDecimalStringArray(
        signature1.concat(signature2)
      ),
      max_fee: toHex(maxFee),
    };
    console.log(signature1);
    console.log(signature2);

    let response: any;
    await axios
      .request({
        method: "POST",
        url: `${provider.gatewayUrl}/add_transaction`,
        data: stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((r) => (response = r))
      .catch((err) => console.log(err));

    await provider.waitForTransaction(response!.data.transaction_hash);

    const { value } = await counter.call("read");

    expect(value).to.equal(2n);
  });

  const selector = (fn: string) => hash.starknetKeccak(fn);
});
