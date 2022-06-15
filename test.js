const ethers = require("ethers");
const {
  FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");
const {
  getFlashbotsProvider,
  provider,
  wallet,
  SANDWICH_CONTRACT,
  CHAIN_ID,
  WETH,
} = require("./src/trade_variables.js");
const { encodeFunctionData } = require("./src/utils.js");
const abi = require("./src/abi/Sandwich.json");

async function simulateTx(sandwichStates, token) {
  const flashbotsProvider = getFlashbotsProvider();

  const targetBlockNumber = (await provider.getBlockNumber()) + 1;
  const block = await provider.getBlock();
  const baseFeePerGas = block.baseFeePerGas; // wei
  const maxBaseFeePerGas = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(
    baseFeePerGas,
    1
  );
  const maxPriorityFeePerGas = ethers.utils.parseUnits("1.0", "gwei");
  const maxFeePerGas = maxPriorityFeePerGas.add(maxBaseFeePerGas);

  const frontrunTxData = encodeFunctionData(abi, "swap", [
    sandwichStates.optimalSandwichAmount,
    sandwichStates.frontrunState.amountOut,
    [WETH, token],
  ]);

  const backrunTxData = encodeFunctionData(abi, "swap", [
    sandwichStates.frontrunState.amountOut,
    sandwichStates.backrun.amountOut,
    [token, WETH],
  ]);

  const transactionBundle = [
    {
      signer: wallet,
      transaction: {
        to: SANDWICH_CONTRACT,
        data: frontrunTxData,
        type: 2,
        chainId: CHAIN_ID,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
        value: 0,
        gasLimit: 250000,
      },
    },
    {
      signer: wallet,
      transaction: {
        to: SANDWICH_CONTRACT,
        data: backrunTxData,
        type: 2,
        chainId: CHAIN_ID,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
        value: 0,
        gasLimit: 250000,
      },
    },
  ];

  const signedTransactions = await flashbotsProvider.signBundle(
    transactionBundle
  );

  const simulation = await flashbotsProvider.simulate(
    signedTransactions,
    targetBlockNumber
  );

  return simulation;
}

exports.simulateTx = simulateTx;

// simulateTx({}, "0x63bfb2118771bd0da7A6936667A7BB705A06c1bA");
