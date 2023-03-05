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
    return response?.data?.data?.subContracts;
  } catch (error) {
    console.error('getExplanation error', error);
  }
}

export async function getContracts() {
  const query = `
    query Contracts {
      contracts {
        id
        blockNumber
        blockTimestamp
        createdAt
        mainContractAddress
        network
        smartReaderContract
        subContracts {
          subContractName
          id
        }
        Annotations {
          annotation
          blockNumber
          blockTimestamp
          createdAt
          id
          mainContract
        }
      }
    }
 
    `;

  try {
    const response = await axios.post(goerliUrl, { query });
    // console.log('response', response.data);
    console.log('response?.data?.data', response?.data?.data);
    return response?.data?.data?.contracts;
  } catch (error) {
    console.error('getExplanation error', error);
  }
}
