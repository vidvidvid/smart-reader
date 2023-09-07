import { Button, Spinner, Tooltip, useToast } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi';
import React, { useEffect, useCallback } from 'react'
import { polygon } from 'wagmi/chains';

import { useWeb3Modal, Web3Button } from '@web3modal/react'
import { shortenAddress } from '../utils/helpers'
import useLogin from '../hooks/useLogin';

export const ConnectButton = () => {
    const { open, setDefaultChain } = useWeb3Modal();
    const { login, logout, isLoggedIn } = useLogin();
    const { disconnect, disconnectAsync, isSuccess } = useDisconnect();
    const {
        address: userAddress,
        isConnected,
        isConnecting,
        isDisconnected,
    } = useAccount();
    const toast = useToast();

    const handleLogout = useCallback(async () => {
        if (isConnected) {
            await disconnectAsync();
            await logout();
            if (!userAddress) {
                toast({
                    title: 'Logged out',
                    description: 'You are now logged out.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    }, [isConnected]);

    const handleLogin = useCallback(async () => {
        console.log('handleLogin entry', { isConnected });
        if (!isConnected) {
            console.log('login');
            open();
            // await setDefaultChain(137);
            if (userAddress) {
                console.log('handleLogin', { isConnected });
                await login();
                toast({
                    title: 'Logged in',
                    description: 'You are now logged in.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }

        }

    }, [isConnected]);

    useEffect(() => {
        setDefaultChain(polygon.chainId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // useEffect(() => {
    //     console.log('logged in?', { isLoggedIn });
    //     if (isConnected && userAddress) login();
    //     if (isDisconnected) logout();
    // }, [isConnected, isDisconnected]);

    return (
        <Tooltip label={isConnected ? "Disconnect and Logout" : "Connect to Login"} aria-label={isConnected ? "Disconnect and Logout" : "Connect to Login"}>
            <Button
                background="transparent"
                color="whiteAlpha.700"
                _hover={{ background: 'transparent', color: 'white' }}
                border="2px solid white"
                borderRadius="full"
                onClick={() => (isConnected ? handleLogout() : handleLogin())}
            >
                {isConnecting && <Spinner size="xs" mr={2} />}{' '}
                {isConnected
                    ? shortenAddress(userAddress)
                    : isConnecting
                        ? 'Connecting'
                        : 'Connect wallet'}
            </Button>
            {/* <Web3Button /> */}
        </Tooltip>
    )
}
