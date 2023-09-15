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
  useToast,
} from '@chakra-ui/react';
import { getNetwork } from '@wagmi/core';
import { useWeb3Modal } from '@web3modal/react';
import { CheckCircle2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import useLogin from '../../hooks/useLogin';
import { shortenAddress, validateContractAddress, lowercaseAddress } from '../../utils/helpers';
import { NavLink as RouterLink } from "react-router-dom";
import { Icon } from '@iconify/react';
import { ConnectButton} from '../ConnectButton';


export const Header = ({ address, setAddress, setFetching }) => {
  const toast = useToast();
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

  const [pageName, setPageName] = useState(undefined);
  // useEffect that gets the current url and sets the page name

  const handlePageName = useCallback(() => {
      const path = window.location.pathname;
    const page = path.split("/").pop();
    console.log({page});
      setPageName(page);
  }, []);

  useEffect(() => {
      handlePageName();
      console.log({pageName});
  });

  // useEffect(() => {
  //   if (isConnected && !isLoggedIn) login();
  //   if (isDisconnected && isLoggedIn) logout();
  // }, [isConnected, isDisconnected]);

  useEffect(() => {
    if (pageName === 'about') {
      console.log('about page');
      return;
    }
    if (address && pageName === '') {
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

  useEffect(() => {
    if (userAddress && address && validationResult.message !== '') {
        toast({
            title: 'Contract validation',
            description: validationResult.message,
            status: validationResult.result ? 'success' : 'error',
            duration: 5000,
            isClosable: true,
        });

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [validationResult]);

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
              defaultValue={!userAddress || !address ? '' : lowercaseAddress(address)}
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
                    isDisabled={!userAddress}
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
        </Box>
        <RouterLink to="/about">
          About
        </RouterLink>
        <ConnectButton address={address} setAddress={setAddress} />
      </Flex>
    </Flex>
  );
};
