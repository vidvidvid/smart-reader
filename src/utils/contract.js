const { Contract } = require('ethers');
const SmartReaderABI = require('./SmartReader.json').abi;

// const getProvider = (network) => {
//   switch (network) {
//     case 'goerli':
//       return new ethers.providers.JsonRpcProvider(
//         'https://rpc.ankr.com/eth_goerli'
//       );
//     case 'ethereum':
//       return new ethers.providers.JsonRpcProvider(
//         'https://rpc.ankr.com/eth_goerli'
//       );
//     case 'polygon':
//       return new ethers.providers.JsonRpcProvider(
//         'https://rpc-mainnet.maticvigil.com'
//       );
//     case 'hardhat':
//     default:
//       return new ethers.providers.JsonRpcProvider();
//   }
// };

const getContract = (network, signer) => {
  const deploymentData = require(`./deployments/${network}.json`);
  const contractAddress = deploymentData.contract;
  return new Contract(contractAddress, SmartReaderABI, signer);
};

module.exports = { getContract };
