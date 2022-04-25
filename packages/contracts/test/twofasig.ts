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

describe("2FASig", function () {
  this.timeout(30_000);

  let counter: StarknetContract;
  let multisig: StarknetContract;
  let multisigContract: Contract;
  let provider: Provider;

  const merkleLeafs = [124, 125];
  const merkleRoot =
    455571898402516024591265345720711356365422160584912150000578530706912124657n;

  beforeEach(async () => {
    const counterFactory = await starknet.getContractFactory("Counter");
    counter = await counterFactory.deploy({ initial: 0n, max: 10n });

    const multisigFactory = await starknet.getContractFactory("twofasig");
    multisig = await multisigFactory.deploy({
      _n: 2,
      pk: pub1,
      _merkle_root: merkleRoot,
    });

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

    const merkleLeaf =
      "1743721452664603547538108163491160873761573033120794192633007665066782417603";
    const merkleProofLen = "2";
    const merkleProof = [
      "275015828570532818958877094293872118179858708489648969448465143543997518327",
      "3081470326846576744486900207655708080595997326743041181982939514729891127832",
    ];
    const signature2 = [merkleLeaf, merkleProofLen, ...merkleProof];

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

    const { value: currentCounter } = await counter.call("read");
    expect(currentCounter).to.equal(2n);

    const { nonce: currentNonce } = await multisig.call("nonce");
    expect(currentNonce).to.equal(1n);
  });

  const selector = (fn: string) => hash.starknetKeccak(fn);
});
