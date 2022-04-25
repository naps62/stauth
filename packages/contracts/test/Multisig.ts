import { starknet } from "hardhat";
import { hash } from "starknet";
import { expect } from "chai";
import { StarknetContract } from "hardhat/types";

describe("Multisig", function () {
  this.timeout(30_000);

  let counter: StarknetContract;
  let multisig: StarknetContract;

  beforeEach(async () => {
    const counterFactory = await starknet.getContractFactory("Counter");
    counter = await counterFactory.deploy({ initial: 0n, max: 10n });

    const multisigFactory = await starknet.getContractFactory("Multisig");
    multisig = await multisigFactory.deploy();
  });

  it.only("works", async () => {
    await multisig.invoke("__execute__", {
      call_array: [
        {
          to: counter.address,
          selector: selector("increment_one"),
          data_offset: 0,
          data_len: 0,
        },
        {
          to: counter.address,
          selector: selector("increment_one"),
          data_offset: 0,
          data_len: 0,
        },
      ],
      calldata: [],
      nonce: 0,
    });

    const { value } = await counter.call("read");

    expect(value).to.equal(2n);
  });

  const selector = (fn: string) => hash.starknetKeccak(fn);
});
