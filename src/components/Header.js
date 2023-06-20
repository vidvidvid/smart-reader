import { ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Input, InputGroup, InputLeftElement, InputRightElement, Link, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/react';
import React, { useEffect } from 'react';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';

import { shortenAddress, isContract } from '../utils/helpers';

export const Header = ({ address, setAddress, setFetching }) => {
  const { open, setDefaultChain } = useWeb3Modal()
  const { address: userAddress, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { chains } = useSwitchNetwork()
  const [validationResult, setValidationResult] = React.useState({
    result: false,
    message: '',
  });

  console.log('chains', chains);

  const validateInput = (input) => {
    let message = '';

    if (input.length === 42 && input.startsWith('0x')) {
      return {
        result: true,
        message: '',
      }
    } else if (input.length < 42 && input.startsWith('0x')) {
      message = 'Address is too short';

      return {
        result: false,
        message,
      }
    } else if (input.length === 42 && !input.startsWith('0x')) {
      message = 'Address is missing 0x prefix';

      return {
        result: false,
        message,
      }
    } else if (input.length < 42 && !input.startsWith('0x')) {
      message = 'Address is too short and missing 0x prefix';

      return {
        result: false,
        message,
      }
    } else if (input.length > 42 && input.startsWith('0x')) {

      message = 'Address is too long';

      return {
        result: false,
        message,
      }
    } else if (input.length > 42 && !input.startsWith('0x')) {
      message = 'Address is too long and missing 0x prefix';

      return {
        result: false,
        message,
      }
    } else {
      isContract(input, chain.provider).then((result) => {
        if (result) {
          message = 'Address is a contract';

          return {
            result: true,
            message,
          }
        } else {
          message = 'Address is not a contract';

          return {
            result: false,
            message,
          }
        }
      })
    }
  }

  useEffect(() => {
    if (address) {
      console.log('address', address);
      validateInput(address);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])


  // TODO: `chains` is sometimes not populated which makes it impossible to switch networks

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
      zIndex={50}
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
            <Text fontSize="sm">{!validationResult.result && validationResult.message}</Text>
            <InputRightElement width='8rem'>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} h='1.75rem' size='sm' borderRadius='full' background="#FFFFFF26" _hover={{ background: '#FFFFFF26' }}>
                  {chain?.name}
                </MenuButton>
                <MenuList background="#FFFFFF26" borderColor='#FFFFFF26'>
                  {chains.map(c =>
                    <MenuItem key={c.id} disabled={c.id === chain?.id}
                      onClick={() => setDefaultChain(c.id)}
                      color={'black'}
                      _hover={{
                        background: 'blackAlpha.200',
                        color: 'white'
                      }}
                    >{c.name}</MenuItem>
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
        <Button background='transparent' color="whiteAlpha.700" _hover={{ background: 'transparent', color: 'white' }} border='2px solid white' borderRadius='full' onClick={() => isConnected ? disconnect() : open()}>{isConnecting && <Spinner size="xs" mr={2} /> } {isConnected ? shortenAddress(userAddress) : isConnecting ? 'Connecting' : 'Connect wallet'}</Button>
      </Flex>
    </Flex>
  );
};
