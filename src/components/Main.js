import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useNetwork } from 'wagmi';
import { Reader } from './Reader';
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
      bgColor="white"
      borderRadius={16}
      pb={2}
    >
      <Header
        address={address}
        setAddress={setAddress}
        setFetching={setFetching}
      />
      <Reader address={address} fetching={fetching} setFetching={setFetching} />
    </Flex>
  );
};
