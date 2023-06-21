import { ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Input, InputGroup, InputLeftElement, InputRightElement, Link, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/react';
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { shortenAddress, isContract } from '../utils/helpers';
import { getNetwork } from '@wagmi/core';
import { CheckCircle2 } from 'lucide-react';

export const Header = ({ address, setAddress, setFetching }) => {
  const { open, setDefaultChain } = useWeb3Modal()
  const { address: userAddress, isConnected, isConnecting, isDisconnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { chain: networkChain, chains: networkChains } = useNetwork()
  const { chain, chains } = getNetwork()
  const {
    chains: switchNetworkChains,
    switchNetwork,
    isLoading: isSwitchingNetwork,
    pendingChainId,
    error: switchNetworkError
  } = useSwitchNetwork()
  const [validationResult, setValidationResult] = useState({
    result: false,
    message: '',
  });

  // const isUnsupportedNetwork = networkChain && !networkChains.includes(networkChain);

  console.log('chains', {chains, networkChains, switchNetworkChains});


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
    setDefaultChain(mainnet.chainId)
  }, [])

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
            {chains.length > 0 ? (
              <Menu>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />} h='1.75rem' size='sm' borderRadius='full' background="#FFFFFF26" color="white" fontWeight="normal"
                    _hover={{ background: '#FFFFFF70' }}
                    _active={{ background: '#FFFFFF60', color: '#101D42' }}
                    _focus={{ outline: '1px dashed #ffffff75' }}
                  >
                  {chain?.name ?? mainnet.name}
                </MenuButton>

                  <MenuList background="#FFFFFF60" borderColor='#FFFFFF60' backdropFilter="blur(10px)">
                    {chains.map(c =>
                      <MenuItem key={c.id} disabled={c.id === chain?.id}
                        onClick={() => switchNetwork(c.id)}
                        display="flex"
                        justifyContent="space-between"
                        color={c.id === chain?.id ? 'white' : '#101D42'}
                        background={c.id === chain?.id ? '#101D4299' : 'transparent'}
                        fontWeight="normal"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                          background: '#101D4280',
                          color: 'white'
                        }}
                      >{c.name} {c.id === chain?.id && <CheckCircle2 size={20} color="green" />}</MenuItem>
                    )}
                  </MenuList>
              </Menu>
                ) : undefined}
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
        <Button background='transparent' color="whiteAlpha.700" _hover={{ background: 'transparent', color: 'white' }} border='2px solid white' borderRadius='full' onClick={() => isConnected ? disconnect() : open()}>{isConnecting && !isDisconnected && <Spinner size="xs" mr={2} /> } {isConnected ? shortenAddress(userAddress) : isConnecting && !isDisconnected ? 'Connecting' : 'Connect wallet'}</Button>
      </Flex>
    </Flex>
  );
};
