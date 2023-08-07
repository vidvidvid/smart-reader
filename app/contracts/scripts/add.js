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
  const mainContract = Wallet.createRandom().address;
  const subContractName = 'Ownable';
  const explanation =
    'bafybeiaixojwq6jcf2blsnj2mlb7cicduvm3g5glumuhchmnsyhiipiily/rinkeby%20copy.json';
  const tx = await smartReader.addContract(
    mainContract,
    subContractName,
    explanation
  );
  console.log(
    `subContract ${subContractName} added to main contract ${mainContract} added with explanation: ${explanation}`
  );

  const logged = await tx.wait();

  console.log('logged', logged);
  if (logged !== undefined) {
    const annotations = [
      { subContractName: 'Ownable', annotation: 'Annotation 1' },
      { subContractName: 'LendingPool', annotation: 'Annotation 2' },
      { subContractName: 'Smart Invoice', annotation: 'Annotation 3' },
    ];

    for (const { subContractName, annotation } of annotations) {
      console.log('adding annotation', annotation, 'to', subContractName);
      await smartReader.addAnnotation(
        mainContract,
        subContractName,
        annotation
      );
      console.log(
        `Annotation ${annotation} added to contract ${mainContract} for subContract ${subContractName}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
