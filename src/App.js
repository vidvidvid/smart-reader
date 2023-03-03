import './App.css';
import { Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { Header } from './components/Header';
import { Reader } from './components/Reader';
import React from 'react';
import SideMenu from './components/SideMenu';
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import { Web3Button, Web3Modal, Web3NetworkSwitch } from '@web3modal/react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  avalanche,
  bsc,
  fantom,
  gnosis,
  mainnet,
  optimism,
  polygon,
} from 'wagmi/chains';

export const Context = React.createContext();

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [fetching, setFetching] = useState(false);

  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
  const chains = [
    arbitrum,
    avalanche,
    bsc,
    fantom,
    gnosis,
    mainnet,
    optimism,
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
    <Flex direction="column" h="100vh">
      <WagmiConfig client={wagmiClient}>
        <Flex position="fixed" right={3} top={3} zIndex={3} gap={3}>
          <Web3Button />
          <Web3NetworkSwitch />
        </Flex>
        <SideMenu />
        <Header
          address={address}
          network={network}
          setAddress={setAddress}
          setNetwork={setNetwork}
          setFetching={setFetching}
        />
        <Reader
          address={address}
          network={network}
          fetching={fetching}
          setFetching={setFetching}
        />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Flex>
  );
}

export default App;
