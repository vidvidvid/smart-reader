import './App.css';
import { Flex } from '@chakra-ui/react';

import { Main } from './components/Main';
import React from 'react';
import SideMenu from './components/SideMenu';
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  avalanche,
  bsc,
  fantom,
  gnosis,
  optimism,
  mainnet,
  polygon,
  goerli,
} from 'wagmi/chains';

export const Context = React.createContext();

function App() {
  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
  const chains = [
    // arbitrum,
    // avalanche,
    // bsc,
    // fantom,
    // gnosis,
    // optimism,
    mainnet,
    polygon,
    goerli,
  ];

  const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId }),
  ]);

  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({
      version: '1',
      appName: 'smartreader',
      chains,
      projectId,
    }),
    provider,
  });

  const ethereumClient = new EthereumClient(wagmiClient, chains);
  return (
    <WagmiConfig client={wagmiClient}>
      <Flex
        direction="column"
        h="100vh"
        p={6}
        bgImage="/images/bg.png"
        backgroundRepeat="round"
      >
        <Flex h="full" gap={6}>
          <Flex w="20%" h="full" zIndex={2}>
            <SideMenu />
          </Flex>
          <Flex w="80%" h="full">
            <Main />
          </Flex>
        </Flex>

        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </Flex>
    </WagmiConfig>
  );
}

export default App;
