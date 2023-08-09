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

  const deploymentPath = path.join(
    __dirname,
    `../deployments/${networkName[network.chainId]}.json`
  );
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath));
  const SmartReader = await hre.ethers.getContractFactory('SmartReader');

  const smartReader = await SmartReader.attach(deploymentData.contract);

  const mainContract = Wallet.createRandom().address;
  const subContractName = 'Ownable';
  const explanation =
    'bafybeiaixojwq6jcf2blsnj2mlb7cicduvm3g5glumuhchmnsyhiipiily/rinkeby%20copy.json';
  const tx = await smartReader.addContract(
    mainContract,
    subContractName,
    explanation
  );


  const logged = await tx.wait();

  if (logged !== undefined) {
    const annotations = [
      { subContractName: 'Ownable', annotation: 'Annotation 1' },
      { subContractName: 'LendingPool', annotation: 'Annotation 2' },
      { subContractName: 'Smart Invoice', annotation: 'Annotation 3' },
    ];

    for (const { subContractName, annotation } of annotations) {
      await smartReader.addAnnotation(
        mainContract,
        subContractName,
        annotation
      );

    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
