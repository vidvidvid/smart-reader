import React from 'react';
import { ethers } from 'ethers';
import { Flex, Input, Select, Tooltip, Button } from '@chakra-ui/react';

export const Header = ({
  address,
  network,
  setAddress,
  setNetwork,
  setFetching,
}) => {
  console.log('network', network);
  return (
    <Flex
      w="full"
      h={16}
      alignItems="center"
      position="fixed"
      justifyContent="center"
      background="linear-gradient(rgba(255, 255, 255, 0.1), transparent)"
      backdropFilter="blur(8px)"
      zIndex={1}
      gap={3}
    >
      <Input
        placeholder="Smart contract address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        maxW="300px"
      />
      <Select
        placeholder="Network"
        onChange={(e) => setNetwork(e.target.value)}
        maxW="300px"
      >
        <option value="ethereum">Ethereum</option>
        <option value="polygon">Polygon</option>
      </Select>

      <Tooltip
        isDisabled={ethers.utils.isAddress(address) && network}
        label="Please input a valid address & select a network"
        shouldWrapChildren
      >
        <Button
          onClick={() => setFetching(true)}
          isDisabled={!ethers.utils.isAddress(address) || !network}
        >
          {' '}
          Go{' '}
        </Button>
      </Tooltip>
    </Flex>
  );
};
