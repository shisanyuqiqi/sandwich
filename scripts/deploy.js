async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from: ", deployer.address);
  const Token = await ethers.getContractFactory("Sandwich");
  const token = await Token.deploy(
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  );
  console.log("Deployed Token Address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
