const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const { Wallet } = require("ethers");

const networkName = {
    1: 'mainnet',
    5: 'goerli',
    137: 'polygon',
    31337: 'hardhat',
  };
  

async function main() {
    const network = await hre.ethers.provider.getNetwork();
    console.log('networkId', network.chainId)
    console.log('adding contract on:', networkName[network.chainId]);
    const deploymentPath = path.join(__dirname, `../deployments/${networkName[network.chainId]}.json`);
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath));
    const SmartReader = await hre.ethers.getContractFactory("SmartReader");

    const smartReader = await SmartReader.attach(deploymentData.contract);
    console.log(`SmartReader address: ${smartReader.address}`)
    const newContract = Wallet.createRandom().address;
    const explanation = "New contract blah blah lots of info";
    const tx = await smartReader.addContract(newContract, explanation);
    console.log(`Contract ${newContract} added with explanation: ${explanation}`);

    if (network.chainId !== 31337) { 
      await tx.wait(); 
    }

    const annotation = "this function is grrrreat!'";
    const functionId = 123;
    await smartReader.addAnnotation(newContract, functionId, annotation);
    console.log(
      `Annotation ${annotation} added to contract ${newContract} for functionId ${functionId}`
    );
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });