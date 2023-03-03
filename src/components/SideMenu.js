import React from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Box,
  useDisclosure,
  Text,
  Flex,
  Link,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

import { useRef, useState } from 'react';

const SideMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
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
      <Button ref={btnRef} colorScheme="teal" onClick={onOpen} m={3}>
        <HamburgerIcon />
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Contract scanner</DrawerHeader>

          <DrawerBody>
            <Input
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
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
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default SideMenu;
