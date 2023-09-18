import { Button, Spinner, Tooltip, useToast } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi';
import React, { useEffect, useCallback } from 'react'
import { mainnet } from 'wagmi/chains';

import { useWeb3Modal } from '@web3modal/react'
import { shortenAddress, lowercaseAddress } from '../utils/helpers'
import useLogin from '../hooks/useLogin';

export const ConnectButton = ({address, setAddress}) => {
    const toast = useToast();
    const { open, setDefaultChain } = useWeb3Modal();
    const { login, logout, isLoggedIn, checkLoggedIn, setIsLoggedIn } = useLogin();
    const { disconnect } = useDisconnect();
    const {
        address: userAddress,
        isConnected,
        isConnecting,
        isDisconnected,
    } = useAccount({
        // onDisconnect: () => {
        //     setAddress('');
        //     logout();

        //     toast({
        //         title: 'Disconnected',
        //         description: 'You are now disconnected & logged out.',
        //         status: 'success',
        //         duration: 5000,
        //         isClosable: true,
        //     });
        // },
        onConnect: async () => {
            try {
                toast({
                    title: 'Connected',
                    description: 'Wallet connection successful.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                await login();

                setIsLoggedIn(true);
                toast({
                    title: 'Logged In',
                    description: 'You are now logged in.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } catch (error) {
                console.log('OMG error', {error});

            }
        }

    });

    useEffect(() => {
        setDefaultChain(mainnet.chainId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // useEffect(() => {
    //     console.log('logged in?', { isLoggedIn });
    //     if (isConnected && userAddress) login();
    //     if (isDisconnected) logout();
    // }, [isConnected, isDisconnected]);

    return (
        <Tooltip label={isConnected ? "Account options" : "Connect to login"} aria-label={isConnected ? "Account options" : "Connect to login"} bgColor="blue.500" fontWeight="600" hasArrow>
            <Button
                background="transparent"
                color="whiteAlpha.700"
                _hover={{ background: 'transparent', color: 'white' }}
                border="2px solid white"
                borderRadius="full"
                onClick={() => (isConnected ? open({route: 'Account'}) : open({route: 'ConnectWallet'}))}
            >
                {isConnecting && <Spinner size="xs" mr={2} />}{' '}
                {isConnected
                    ? shortenAddress(lowercaseAddress(userAddress))
                    : (isConnecting && !isDisconnected)
                        ? 'Connecting'
                        : 'Connect wallet'}
            </Button>
        </Tooltip>
    )
}
