const chainInfo = ({ chain }) => {
  let APIKEY;
  let blockExplorerApi;
  let blockExplorerUrl;

  if (chain?.id === 137) {
    blockExplorerApi = 'api.polygonscan.com/api';
    blockExplorerUrl = 'https://polygonscan.com';
    APIKEY = process.env.REACT_APP_POLYGONSCAN_API_KEY;
  } else if (chain?.id === 1) {
    blockExplorerApi = 'api.etherscan.io/api';
    blockExplorerUrl = 'https://etherscan.io';
    APIKEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
  } else if (chain?.id === 5) {
    blockExplorerApi = 'api-goerli.etherscan.io/api';
    blockExplorerUrl = 'https://goerli.etherscan.io/';
    APIKEY = process.env.REACT_APP_GOERLI_API_KEY;
  }

  return {
    APIKEY,
    blockExplorerApi,
    blockExplorerUrl,
  };
};

export default chainInfo;
