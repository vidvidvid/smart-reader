import axios from 'axios';
const { goerliUrl } = require('./constants');


export async function getExplanation(address, name) {
  const query = `
  query SmartReader($address: ID!, $subContractName: String!) {
    subContracts(where: {subContractName: $subContractName, mainContract: $address}) {
      blockNumber
      blockTimestamp
      transactionHash
      subContractName
      smartReaderContract
      network
      mainContract
      ipfsSchema
      id
      createdAt
    }
  }
 
    `;

  const variables = {
    address: address.toLowerCase(),
    subContractName: name,
  };

  try {
    const response = await axios.post(goerliUrl, { query, variables });
    // console.log('response', response.data);
    return response.data.data.subContracts;
  } catch (error) {
    console.error('getExplanation error', error);
  }
}


