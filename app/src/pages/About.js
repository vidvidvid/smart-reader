import { Flex, Box, Heading, Image, Link, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNetwork } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { NavLink as RouterLink } from "react-router-dom";
import { Header } from '../components/Header';

export const AboutPage = ({ projectId, ethereumClient }) => {
    const { chain } = useNetwork();
    console.log('chain', chain);
    const [fetching, setFetching] = useState(false);
    const [address, setAddress] = useState('');
    console.log("AboutPage", projectId, ethereumClient);

    return (
        <Flex
            position="relative"
            direction="column"
            h="full"
            p={6}
            bgGradient="radial(43.95% 43.95% at 30.69% 0%, #172F74 0.18%, #101D42 100%)"
            backgroundRepeat="no-repeat"
        >
            <Flex
                position="relative"
                h="full"
                w="full"
                direction="column"
                color='white'
                gap={4}
            >
                <Header
                    address={address}
                    setAddress={setAddress}
                    setFetching={setFetching}
                />

                <Stack
                    h="calc(100vh - 130px)"
                    w="full"
                    alignItems={"center"}
                    justifyContent={"center"}
                    background="#FFFFFF1A"
                    backdropFilter="blur(8px)"
                    p={6}
                    borderRadius="8px"
                    gap={8}
                    zIndex={10}
                >
                    <Flex flexDirection="column" alignItems="center" gap={8} maxW="3xl" textAlign="center" fontSize="lg">
                    <Flex flexDirection="row" gap={2} alignItems="center">
                            <Image src={'/images/document.svg'} />
                            {/* This should be the name of the contract address the user plugs in */}
                            <Heading as="h1" size="lg" fontWeight={600} noOfLines={1}>
                                About Smart Reader
                            </Heading>
                        </Flex>
                    <Text as="p"><strong>What is it?</strong> Smart Reader is a decentralized application that allows users to easily learn about smart contracts and the web3 ecosystem.</Text>

                        <Text as="p"><strong>How?</strong> The dapp takes in a smart contract address, queries Etherscan for the contract's code, and then queries ChatGPT to convert the code into a human-readable document.</Text>
                        <Text as="p"><strong>Who?</strong> Some text about the client who commissioned the app.</Text>
                        <Link as={RouterLink} to="/" background="whiteAlpha.400" px={5} py={3} borderRadius="full" border="2px" fontweight={600}>Use the dApp</Link>
                    </Flex>
                </Stack>
                <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
                <Box position="absolute" inset={0} bgGradient="radial(53.95% 53.95% at 80.69% 66%, #172F74 0.18%, transparent 100%)" w="100%" h="100%" opacity="50%" zIndex={0} />
            </Flex>
        </Flex>
    );
};
