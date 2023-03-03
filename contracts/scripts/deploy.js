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
  console.log('Deploying SmartReader on network:', networkName[chainId]);
  console.log('Deploying account:', address);
  const SmartReader = await ethers.getContractFactory('SmartReader');
  const smartReader = await SmartReader.deploy();

  await smartReader.deployed();

  console.log(`SmartReader deployed to: ${smartReader.address}`);

  const txHash = smartReader.deployTransaction.hash;

  console.log("Transaction Hash:", txHash);

  const receipt = await deployer.provider.getTransactionReceipt(txHash);

  const deploymentInfo = {
    network: networkName[chainId],
    contract: smartReader.address,
    txHash,
    blockNumber: receipt.blockNumber.toString(),
  };

  fs.writeFileSync(
    `deployments/${networkName[chainId]}.json`,
    JSON.stringify(deploymentInfo, undefined, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
