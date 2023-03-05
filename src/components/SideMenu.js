import React from 'react';
import { Input, Image, Text, Flex, Link, Divider } from '@chakra-ui/react';

import { useState } from 'react';
import chainInfo from '../utils/chainInfo';
import { useNetwork } from 'wagmi';

const SideMenu = () => {
  const [search, setSearch] = useState('');
  const [solFiles, setSolFiles] = useState([
    {
      name: 'test.sol',
      contract: 'Test',
      address: '0x1234567890',
      explanations: 3,
    },
    {
      name: 'test2.sol',
      contract: 'Test2',
      address: '0x1234567890',
      explanations: 1,
    },
    {
      name: 'test3.sol',
      contract: 'Test3',
      address: '0x1234567890',
      explanations: 5,
    },
  ]);
  const { chain } = useNetwork();

  const { blockExplorerUrl } = chainInfo({ chain });

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
      <Flex direction="column" mt="23px">
        <Flex alignItems="center" gap={3}>
          <Image src="images/logo.png" w={10} filter="invert()" />
          <Text fontWeight="bold">Smart Reader</Text>
        </Flex>

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
              href={`${blockExplorerUrl}/address/${file.address}`}
              key={file.name + file.contract}
            >
              <Flex key={file.name} justifyContent="space-between">
                <Text>{file.name}</Text> <Text>({file.explanations})</Text>
              </Flex>
            </Link>
          ))}
      </Flex>
    </Flex>
  );
};

export default SideMenu;
