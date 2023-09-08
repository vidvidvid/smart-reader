import { Flex, Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNetwork, useAccount } from 'wagmi';
import { Content } from './Content';
import { Header } from '../common/Header';

export const Main = () => {
  const { chain } = useNetwork();
  console.log('chain', chain);
  const { address: userAddress, isConnected } = useAccount();
  const [fetching, setFetching] = useState(false);
  const [address, setAddress] = useState(isConnected ? '0x0000000000000000000000000000000000001010' : '');

  return (
    <Flex
      position="relative"
      h="full"
      w="full"
      direction="column"
      color='white'
      gap={4}
    >
      <Header
        address={address}
        setAddress={setAddress}
        setFetching={setFetching}
      />
      <Content
        address={address}
        fetching={fetching}
        setFetching={setFetching}
      />
    </Flex>
  );
};
