const { ethers } = require('hardhat');
const fs = require('fs');

const networkName = {
  1: 'mainnet',
  5: 'goerli',
  137: 'polygon',
  31337: 'hardhat',
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const address = await deployer.getAddress();
  const { chainId } = await deployer.provider.getNetwork();
  const SmartReader = await ethers.getContractFactory('SmartReader');
  const smartReader = await SmartReader.deploy();

  await smartReader.deployed();


  const txHash = smartReader.deployTransaction.hash;

  const receipt = await deployer.provider.getTransactionReceipt(txHash);

  const deploymentInfo = {
    network: networkName[chainId],
    contract: smartReader.address,
    txHash,
    blockNumber: receipt.blockNumber.toString(),
  };

  fs.writeFileSync(
    `deployments/${networkName[chainId]}.json`,
    JSON.stringify(deploymentInfo, undefined, 2)
  );

  fs.writeFileSync(
    `../src/utils/deployments/${networkName[chainId]}.json`,
    JSON.stringify(deploymentInfo, undefined, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
