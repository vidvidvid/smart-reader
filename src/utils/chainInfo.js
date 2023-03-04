const chainInfo = ({ chain }) => {
  let APIKEY;
  let blockExplorerUrl;

  if (chain?.id === 1) {
    APIKEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
  } else if (chain?.id === 137) {
    APIKEY = process.env.REACT_APP_POLYGONSCAN_API_KEY;
  } else if (chain?.id === 5) {
    APIKEY = process.env.REACT_APP_GOERLI_API_KEY;
  }

  if (chain?.id === 137) {
    blockExplorerUrl = 'api.polygonscan.com/api';
  } else if (chain?.id === 1) {
    blockExplorerUrl = 'api.etherscan.io/api';
  } else if (chain?.id === 5) {
    blockExplorerUrl = 'api-goerli.etherscan.io/api';
  }

  return {
    APIKEY,
    blockExplorerUrl,
  };
};

export default chainInfo;
