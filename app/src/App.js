import { Flex, Box } from '@chakra-ui/react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
} from '@web3modal/ethereum';
import React from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { AboutPage } from './pages/About';
import { HomePage } from './pages/Home';

import { SupabaseProvider } from './utils/supabaseContext';

export const Context = React.createContext();

function App() {
    const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? '95acf4d616f997af76057a82ad846fae';
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
                <Router>
                    <Routes>
                        <Route exact path="/" element={<HomePage projectId={projectId} ethereumClient={ethereumClient} />} />
                        <Route path="/about" element={<AboutPage projectId={projectId} ethereumClient={ethereumClient} />} />
                    </Routes>
                </Router>
            </WagmiConfig>
        </SupabaseProvider>

    );
}

export default App;
