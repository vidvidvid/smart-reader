import { ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { getNetwork } from '@wagmi/core';
import { useWeb3Modal } from '@web3modal/react';
import { CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import useLogin from '../../hooks/useLogin';
import { shortenAddress, validateContractAddress } from '../../utils/helpers';
import { NavLink as RouterLink } from "react-router-dom";

export const Header = ({ address, setAddress, setFetching }) => {
  const { open, setDefaultChain } = useWeb3Modal();
  const {
    address: userAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();
  const { login, logout, isLoggedIn } = useLogin();
  const { disconnect } = useDisconnect();
  const { chain: networkChain, chains: networkChains } = useNetwork();
  const { chain, chains } = getNetwork();
  const {
    chains: switchNetworkChains,
    switchNetwork,
    isLoading: isSwitchingNetwork,
    pendingChainId,
    error: switchNetworkError,
  } = useSwitchNetwork();
  const [validationResult, setValidationResult] = useState({
    result: false,
    message: '',
  });

  useEffect(() => {
    setDefaultChain(mainnet.chainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected && !isLoggedIn) login();
    if (isDisconnected && isLoggedIn) logout();
  }, [isConnected, isDisconnected]);

  useEffect(() => {
    if (address) {
      console.log('address', address);
      validateContractAddress(
        address,
        userAddress,
        validationResult,
        setValidationResult
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain?.id]);

  return (
    <Flex
      h={{ base: 'full', lg: 16 }}
      w="full"
      flexWrap="wrap"
      alignItems="center"
      background="#FFFFFF1A"
      backdropFilter="blur(8px)"
      px={6}
      py={{ base: 6, lg: 0 }}
      gap={6}
      borderRadius="8px"
      justifyContent="space-between"
      zIndex={50}
    >
          <Box>
              <RouterLink to="/">
                  <Image src="images/logo.svg" w={8} h={8} alt="SmartReader logo" />
                  </RouterLink>
      </Box>
      <Flex alignItems="center" flexWrap="wrap" gap={6}>
        <Box w={{ base: 'full', lg: 'auto' }}>
          <InputGroup size={{ base: 'sm', lg: 'md' }}>
            <InputLeftElement>
              <Search2Icon color={!userAddress ? "whiteAlpha.600" : "white"} />
            </InputLeftElement>
            <Input
              w={{ base: 'full', lg: '35rem' }}
              borderRadius="full"
              variant="filled"
              background="#00000026"
              pr={{ base: '6.5rem', lg: 0 }}
              _placeholder={{ color: 'white' }}
              _hover={{ background: '#00000026' }}
              placeholder={!userAddress ? "Connect to search contracts..." : "Search contracts..."}
              defaultValue={address}
              outline={
                validationResult.message !== '' && validationResult.result
                  ? '1px solid green'
                  : validationResult.message
                  ? '1px solid red'
                  : 'none'
              }
              onChange={(e) => {
                setAddress(e.target.value);
                validateContractAddress(
                  address,
                  userAddress,
                  validationResult,
                  setValidationResult
                );
                setFetching(true);
                e.target.value.length === 0 &&
                  setValidationResult({ result: false, message: '' });
              }}
                          isDisabled={isSwitchingNetwork || !userAddress}
            />

            <InputRightElement width="8rem" justifyContent="flex-end" mr={2}>
              {chains.length > 0 ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    h="1.75rem"
                    size="sm"
                    borderRadius="full"
                    background="#FFFFFF26"
                    color="white"
                    fontWeight="normal"
                    _hover={{ background: '#FFFFFF70' }}
                    _active={{ background: '#FFFFFF60', color: '#101D42' }}
                    _focus={{ outline: '1px dashed #ffffff75' }}
                  >
                    {chain?.name ?? mainnet.name}
                  </MenuButton>

                  <MenuList
                    background="#FFFFFF60"
                    borderColor="#FFFFFF60"
                    backdropFilter="blur(10px)"
                  >
                    {chains.map((c) => (
                      <MenuItem
                        key={c.id}
                        disabled={c.id === chain?.id}
                        onClick={() => switchNetwork(c.id)}
                        display="flex"
                        justifyContent="space-between"
                        color={c.id === chain?.id ? 'white' : '#101D42'}
                        background={
                          c.id === chain?.id ? '#101D4299' : 'transparent'
                        }
                        fontWeight="normal"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                          background: '#101D4280',
                          color: 'white',
                        }}
                      >
                        {c.name}{' '}
                        {c.id === chain?.id && (
                          <CheckCircle2 size={20} color="green" />
                        )}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              ) : undefined}
            </InputRightElement>
          </InputGroup>
          {!validationResult.result && validationResult.message && (
            <Text px={10} fontSize="xs" color="red.400">
              {validationResult.message}
            </Text>
          )}
        </Box>
        <RouterLink to="/about">
          About
        </RouterLink>
        {/* <Login /> */}
        <Button
          background="transparent"
          color="whiteAlpha.700"
          _hover={{ background: 'transparent', color: 'white' }}
          border="2px solid white"
          borderRadius="full"
          onClick={() => (isConnected ? disconnect() : open())}
        >
          {isConnecting && <Spinner size="xs" mr={2} />}{' '}
          {isConnected
            ? shortenAddress(userAddress)
            : isConnecting
            ? 'Connecting'
            : 'Connect wallet'}
        </Button>
      </Flex>
    </Flex>
  );
};
