import { Flex } from '@chakra-ui/react';
import './App.css';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import React from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { Main } from './components/containers/Main';

import { SupabaseProvider } from './utils/supabaseContext';

export const Context = React.createContext();

function App() {
  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
  const chains = [mainnet, polygon];

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);

  const wagmiClient = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
      version: '1',
      appName: 'smartreader',
      chains,
      projectId,
    }),
    publicClient,
  });

  const ethereumClient = new EthereumClient(wagmiClient, chains);
  return (
    <SupabaseProvider>
      <WagmiConfig config={wagmiClient}>
        <Flex
          direction="column"
          h="full"
          p={6}
          bgGradient="radial(43.95% 43.95% at 30.69% 0%, #172F74 0.18%, #101D42 100%)"
          backgroundRepeat="no-repeat"
        >
          <Main />
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </Flex>
      </WagmiConfig>
    </SupabaseProvider>
  );
}

export default App;
