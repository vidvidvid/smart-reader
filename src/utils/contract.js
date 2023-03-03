const { ethers, Contract, Wallet } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../contracts/.env') });


const abi = require('../../contracts/build/contracts/SmartReader.sol/SmartReader.json').abi;
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_goerli');
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

  
export const contract = new Contract('0x02994059E2270d85ceff0E7E2510281d50eaCb1C', abi, signer);












