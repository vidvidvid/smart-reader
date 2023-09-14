import { Flex, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNetwork, useAccount } from 'wagmi';
import { Content } from './Content';
import { Header } from '../common/Header';

export const Main = () => {
  const { chain } = useNetwork();
  const { address: userAddress, isConnected } = useAccount();
    const [fetching, setFetching] = useState(false);
    const defaultContract = !isConnected ? '' : chain.id === 137 ? '0x0000000000000000000000000000000000001010' : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    const [address, setAddress] = useState(defaultContract);

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
