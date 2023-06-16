import { ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Input, InputGroup, InputLeftElement, InputRightElement, Link, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/react';
import React from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

export const Header = ({ address, setAddress, setFetching }) => {
  const { open, setDefaultChain  } = useWeb3Modal()
  const { chain } = useNetwork()
  const { chains } = useSwitchNetwork()
  return (
    <Flex
      h={16}
      alignItems="center"
      background="#FFFFFF1A"
      backdropFilter="blur(8px)"
      px={6}
      gap={6}
      borderRadius='8px'
      justifyContent='space-between'
    >
      <Box>
        <Image src="images/logo.svg" w={8} h={8} />
      </Box>
      <Flex alignItems='center' gap={6}>
        <Box>
          <InputGroup size='md'>
            <InputLeftElement>
              <Search2Icon color='white' />
            </InputLeftElement>
            <Input
              w='35rem'
              borderRadius='full'
              variant='filled'
              background='#00000026'
              _placeholder={{ color: 'white' }}
              _hover={{ background: '#00000026' }}
              placeholder="Search contracts..."
              defaultValue={address}
              onChange={(e) => {
                console.log(e.target.value);
                console.log('address.current', address);
                setAddress(e.target.value);
                setFetching(true)
                console.log('fetching test 1')
              }}
            />
            <InputRightElement width='8rem'>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} h='1.75rem' size='sm' borderRadius='full' background="#FFFFFF26" _hover={{ background: '#FFFFFF26' }}>
                  {chain?.name}
                </MenuButton>
                <MenuList background="#FFFFFF26" borderColor='#FFFFFF26'>
                  {chains.map(c =>
                    <MenuItem key={c.id} disabled={c.id === chain?.id}
                    onClick={() => setDefaultChain(c.id)}>{c.name}</MenuItem>
                    )}
                </MenuList>
              </Menu>
            </InputRightElement>
          </InputGroup>
        </Box>
          <Link
            href=""
            target="_blank"
            color="white"
          >
            About
          </Link>
          <Button background='transparent' _hover={{ background: 'transparent' }} border='2px solid white' borderRadius='full' onClick={() => open()}>Connect wallet</Button>
      </Flex>
    </Flex>
  );
};
