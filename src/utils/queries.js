import axios from 'axios';
const { goerliUrl } = require('./constants');

// need to put contractAddress back as a param
export async function getExplanation(address) {
  const query = `
  query SmartReader($address: ID!) {
    contracts(where: {address: $address}) {
      id
      address
      blockNumber
      blockTimestamp
      createdAt
      network
      smartReaderContract
      transactionHash
      ipfsSchema
      Annotations {
        annotation
        id
        functionId
      }
    }
  }
    `;

  const variables = {
    address: address.toLowerCase(),
  };

  try {
    const response = await axios.post(goerliUrl, { query, variables });
    return response.data.data.contracts;
  } catch (error) {
    console.error('getExplanation error', error);
  }
}

// module.exports = { getExplanation };
// getExplanation('0xc5e7441639900f219afee5ef64c10d911a4ec89d')
