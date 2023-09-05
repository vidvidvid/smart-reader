import { Button, Spinner, Tooltip } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi';
import React, { useEffect } from 'react'
import { useWeb3Modal } from '@web3modal/react'
import { shortenAddress } from '../utils/helpers'
import useLogin from '../hooks/useLogin';

export const ConnectButton = () => {
    const { open, setDefaultChain } = useWeb3Modal();
    const { login, logout, isLoggedIn } = useLogin();
    const { disconnect } = useDisconnect();
    const {
        address: userAddress,
        isConnected,
        isConnecting,
        isDisconnected,
    } = useAccount();

    useEffect(() => {
        console.log('logged in?', { isLoggedIn });
        if (isConnected && userAddress && !isLoggedIn) login();
        if (isDisconnected) logout();
    }, [isConnected, isDisconnected]);

    return (
        <Tooltip label={isConnected ? "Disconnect and Logout" : "Connect to Login"} aria-label={isConnected ? "Disconnect and Logout" : "Connect to Login"}>
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
        </Tooltip>
    )
}
