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
import { mainnet, polygon } from 'wagmi/chains';

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
    <Flex
      direction="column"
      h="100vh"
      p={6}
      bgImage="/images/bg.png"
      backgroundRepeat="round"
    >
      <WagmiConfig client={wagmiClient}>
        <Flex h="full">
          <Flex w="20%" h="100%" zIndex={2}>
            <SideMenu />
          </Flex>
          <Flex w="80%" h="100%">
            <Main />
          </Flex>
        </Flex>
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Flex>
  );
}

export default App;
