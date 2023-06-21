import { Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNetwork } from 'wagmi';
import { Content } from './Content';
import { Header } from './Header';

export const Main = () => {
  const { chain } = useNetwork();
  console.log('chain', chain);
  const [fetching, setFetching] = useState(false);
  const [address, setAddress] = useState('');

  return (
    <Flex
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
