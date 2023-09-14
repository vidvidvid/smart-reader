import React from 'react'
import { Stack, Flex, Heading, Image, Link, Button, Spinner, Text, Badge } from '@chakra-ui/react';
import { shortenAddress } from '../../utils/helpers';
import { CopyIcon } from '@chakra-ui/icons';

export default function ContractMetaData({
  contractName,
  validationResult,
  address,
  userAddress,
  setValue,
  onCopy,
  hasCopied,
  blockExplorerUrl,
  contractCreation,
  isFetchingCreator,
  value
}) {
  return (
    <Stack>
        <Flex alignItems="center" gap={2}>
          <Image src={'/images/document.svg'} />
          {/* This should be the name of the contract address the user plugs in */}
          <Heading as="h1" size="lg" fontWeight={600} noOfLines={1}>
            {contractName}
          </Heading>
        </Flex>
        <Flex alignItems="center">
          {address && userAddress && validationResult.result ? (
            <>
              <Link
                href={`${blockExplorerUrl}/address/${address}`}
                fontSize="sm"
                color="#A4BCFF"
                isExternal
              >
                {shortenAddress(address)}
              </Link>
              <Button
                variant="unstyled"
                size="sm"
                onClick={() => {
                  setValue(address);
                  onCopy(value);
                }}
                position="relative"
              >
                <CopyIcon color="white" />
                <Badge
                  position="absolute"
                  display="block"
                  top={0}
                  right="auto"
                  transformOrigin="center"
                  transform="translate3d(-25%, -13px, 0)"
                  colorScheme="green"
                  variant="solid"
                  borderRadius="sm"
                >
                  {hasCopied ? 'Copied!' : undefined}
                </Badge>
              </Button>
            </>
          ) : (
            <Text fontSize="sm">
              {!userAddress
                ? 'Connect your wallet'
                : !validationResult.result
                ? 'No valid address'
                : 'No contract selected'}
            </Text>
          )}
        </Flex>
        <Heading as="h2" size="md" fontWeight={600} noOfLines={1}>
          CREATOR
        </Heading>

        {isFetchingCreator && (
          <Flex gap={1} alignItems="center">
            <Spinner size="xs" /> Fetching creator...
          </Flex>
        )}

        {!isFetchingCreator &&
        contractCreation &&
        contractCreation.creator !== '' &&
        validationResult.result ? (
          <Flex gap={1}>
            <Link
              href={`${blockExplorerUrl}/address/${contractCreation.creator}`}
              fontSize="sm"
              color="#A4BCFF"
              isExternal
            >
              {shortenAddress(contractCreation.creator)}
            </Link>
            <Text fontSize="sm">at txn</Text>
            <Link
              href={`${blockExplorerUrl}/tx/${contractCreation.creationTxn}`}
              fontSize="sm"
              color="#A4BCFF"
              isExternal
            >
              {shortenAddress(contractCreation.creationTxn)}
            </Link>
          </Flex>
        ) : (
          <Text fontSize="sm">
            {!userAddress
              ? 'Connect your wallet'
              : !validationResult.result
              ? 'No valid address'
              : 'No contract selected'}
          </Text>
        )}
      </Stack>
  )
}
