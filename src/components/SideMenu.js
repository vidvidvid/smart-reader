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
    <Box position="fixed" zIndex={2}>
      <Box p={3}>
        <Text>sR</Text>
        <Divider p={3} />
        <Input
          mt={3}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </Box>
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
    </Box>
  );
};

export default SideMenu;
