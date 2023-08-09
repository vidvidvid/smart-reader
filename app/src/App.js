import { Flex } from '@chakra-ui/react';
import './App.css';

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import React from 'react';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { goerli, mainnet, polygon } from 'wagmi/chains';
import { Main } from './components/Main';

import { SupabaseProvider } from './utils/supabaseContext';

export const Context = React.createContext();
//newentery
function App() {
  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
  const chains = [mainnet, polygon, goerli];

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
    <SupabaseProvider>
      <WagmiConfig client={wagmiClient}>
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