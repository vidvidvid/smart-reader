const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const networkName = {
  1: 'mainnet',
  5: 'goerli',
  137: 'polygon',
  31337: 'hardhat',
};

async function main() {
  const contractAddress = '0xeb7a32ffdcd67003a7b58aa3c7e5ebb63b118725';
  const network = await hre.ethers.provider.getNetwork();

  const deploymentPath = path.join(
    __dirname,
    `../deployments/${networkName[network.chainId]}.json`
  );
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath));
  const SmartReader = await hre.ethers.getContractFactory('SmartReader');

  const smartReader = await SmartReader.attach(deploymentData.contract);
  const annotation = 'e';
  const functionId = 123;
  const tx = await smartReader.addAnnotation(
    contractAddress.toLowerCase(),
    functionId,
    annotation
  );


  if (network.chainId !== 31337) {
    await tx.wait();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
