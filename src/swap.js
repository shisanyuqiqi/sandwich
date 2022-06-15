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
} = require("./trade_variables.js");
const { encodeFunctionData, getRawTransaction } = require("./utils.js");
const abi = require("./abi/Sandwich.json");

const buildFlashbotsTx = async (sandwichStates, token, victimTx) => {
  const flashbotsProvider = await getFlashbotsProvider();

  const nonce = await provider.getTransactionCount(wallet.address);
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

  /* 
  Temp fix without simulating victim tx 
  Error: signature missing v and recoveryParam
  */
  const backrunTxData = encodeFunctionData(abi, "swap", [
    sandwichStates.frontrunState.amountOut,
    sandwichStates.backrunState.amountOut,
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
        gasLimit: 250000,
        nonce: nonce,
      },
    },
    {
      signedTransaction: getRawTransaction(victimTx),
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
        nonce: nonce + 1,
      },
    },
  ];

  const signedTransactions = await flashbotsProvider.signBundle(
    transactionBundle
  );

  return signedTransactions;
};

exports.buildFlashbotsTx = buildFlashbotsTx;
