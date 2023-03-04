import React from 'react';
import { Input, Box, Text, Flex, Link, Divider } from '@chakra-ui/react';

import { useState } from 'react';

const SideMenu = () => {
  const [search, setSearch] = useState('');
  const [solFiles, setSolFiles] = useState([
    {
      name: 'test.sol',
      contract: 'Test',
      address: '0x1234567890',
    },
    {
      name: 'test2.sol',
      contract: 'Test2',
      address: '0x1234567890',
    },
    {
      name: 'test3.sol',
      contract: 'Test3',
      address: '0x1234567890',
    },
  ]);

  return (
    <Flex
      zIndex={2}
      textColor="white"
      direction="column"
      w="full"
      overflowX="hidden"
      overflowY="auto"
      gap={3}
    >
      <Flex direction="column">
        <Text>sR</Text>
        <Divider my={3} />
        <Input
          mt={3}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </Flex>
      <Flex direction="column" gap={1}>
        {solFiles
          .filter((file) => {
            return (
              file.name.toLowerCase().includes(search.toLowerCase()) ||
              file.contract.toLowerCase().includes(search.toLowerCase())
            );
          })
          .map((file) => (
            <Link
              href={`https://etherscan.io/address/${file.address}`}
              key={file.name + file.contract}
            >
              <Flex key={file.name}>
                <Text>{file.name}</Text>
                <Text>{file.contract}</Text>
                <Text>{file.address}</Text>
              </Flex>
            </Link>
          ))}
      </Flex>
    </Flex>
  );
};

export default SideMenu;
