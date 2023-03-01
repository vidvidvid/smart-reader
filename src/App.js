import './App.css';
import { Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { Header } from './components/Header';
import { Reader } from './components/Reader';
import React from 'react';

export const Context = React.createContext();

function App() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [fetching, setFetching] = useState(false);

  return (
    <Flex direction="column" h="100vh">
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
    </Flex>
  );
}

export default App;
