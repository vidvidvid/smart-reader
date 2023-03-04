const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');

const networkName = {
  1: 'mainnet',
  5: 'goerli',
  137: 'polygon',
  31337: 'hardhat',
};

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  console.log('networkId', network.chainId);
  console.log('adding contract on:', networkName[network.chainId]);
  const deploymentPath = path.join(
    __dirname,
    `../deployments/${networkName[network.chainId]}.json`
  );
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath));
  const SmartReader = await hre.ethers.getContractFactory('SmartReader');

  const smartReader = await SmartReader.attach(deploymentData.contract);
  console.log(`SmartReader address: ${smartReader.address}`);
  const newContract = Wallet.createRandom().address;
  const explanation =
    'bafybeiaixojwq6jcf2blsnj2mlb7cicduvm3g5glumuhchmnsyhiipiily/rinkeby%20copy.json';
  const tx = await smartReader.addContract(newContract, explanation);
  console.log(`Contract ${newContract} added with explanation: ${explanation}`);

  if (network.chainId !== 31337) {
    await tx.wait();
  }
  const annotations = [
    { functionId: 1, annotation: 'Annotation 1' },
    { functionId: 2, annotation: 'Annotation 2' },
    { functionId: 3, annotation: 'Annotation 3' },
  ];

  for (const { functionId, annotation } of annotations) {
    await smartReader.addAnnotation(newContract, functionId, annotation);
    console.log(
      `Annotation ${annotation} added to contract ${newContract} for functionId ${functionId}`
    );
  }
  // const annotation = "maybe this one too!'";
  // const functionId = 1;
  // await smartReader.addAnnotation(newContract, functionId, annotation);
  // console.log(
  //   `Annotation ${annotation} added to contract ${newContract} for functionId ${functionId}`
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
