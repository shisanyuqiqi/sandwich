const ethers = require("ethers");
const {
  FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const SandwichAbi = require("./abi/Sandwich.json");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAPV3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const TOKENS_TO_MONITOR = [
  "0xe895507c3Fb0D156D633B746298349D158f66a85",
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
];
const MAX_WETH_TO_SANDWICH = 0.1;
const SANDWICH_CONTRACT = "0xF0CD4Ba4716B2E78394f5590Fe4964DD1d93334D";

const CHAIN_ID = 1;
const WSS = process.env.ethereum_WSS_URL;
const FLASHBOTS_ENDPOINT = "https://rpc.flashbots.net";

const provider = new ethers.providers.WebSocketProvider(WSS);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const getFlashbotsProvider = async () => {
  return await FlashbotsBundleProvider.create(
    provider,
    wallet,
    FLASHBOTS_ENDPOINT,
    "ethereum"
  );
};
const sandwichContract = new ethers.Contract(
  SANDWICH_CONTRACT,
  SandwichAbi,
  wallet
);

module.exports = {
  UNISWAPV2_ROUTER,
  UNISWAPV3_ROUTER,
  WETH,
  TOKENS_TO_MONITOR,
  MAX_WETH_TO_SANDWICH,
  SANDWICH_CONTRACT,
  FLASHBOTS_ENDPOINT,
  CHAIN_ID,
  provider,
  getFlashbotsProvider,
  wallet,
  sandwichContract,
};
