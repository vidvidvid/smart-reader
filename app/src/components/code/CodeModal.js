import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalOverlay,Box, ModalBody, ModalCloseButton, Flex, Text, Image, Spinner } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SimulateTransaction } from '../SimulateTransaction';

export default function CodeModal({
  isOpenSimulate,
  onCloseSimulate,
  inspectFunction,
  functionExplanation,
  isLoadingFunction,
  functionMessages,
  address,
  network,
  contractABI,
  userAddress,
  isConnected
}) {
  return (
    <Modal isOpen={isOpenSimulate} onClose={onCloseSimulate}>
        <ModalOverlay />
        <ModalContent
          minW="800px"
          maxH="calc(100% - 80px)"
          borderRadius={16}
          overflow={'hidden'}
        >
          <ModalHeader
            background="#262545"
            position="relative"
            mt={2}
            mx={2}
            color="white"
            borderTopRadius={16}
            justifyItems="space-between"
          >
            <code>Simulate function: {inspectFunction.name}</code>
            <ModalCloseButton color="white" top="25%" />
          </ModalHeader>
          <ModalBody py={6}>
            <Box
              flexGrow={0}
              w="100%"
              h="100%"
              overflowY="auto"
              pb={8}
              borderRadius="xl"
            >
              {inspectFunction &&
              Object.values(inspectFunction).every((value) => !value) ? null : (
                <Flex flexDirection={'column'} gap={3}>
                  <Flex gap={3} border="1px solid red">
                    <Flex
                      flexGrow={1}
                      w="50%"
                      maxH="600px"
                      overflowY="auto"
                      direction="column"
                      gap={3}
                      border="1px solid red"
                    >
                      <Flex gap={3}>
                        <Image src="/images/sourcecode.png" w={6} />
                        <Text fontWeight="bold"> Source code </Text>
                      </Flex>
                      <Flex
                        p={2}
                        bg="rgb(40, 42, 54)"
                        overflow="hidden"
                        borderRadius={16}
                      >
                        <SyntaxHighlighter
                          language="solidity"
                          style={dracula}
                          wrapLines={true}
                        >
                          {inspectFunction.code ? inspectFunction.code : ''}
                        </SyntaxHighlighter>
                      </Flex>
                    </Flex>

                    <Box
                      w="50%"
                      maxH="600px"
                      overflowY="auto"
                      direction="column"
                      gap={3}
                    >
                      {isLoadingFunction && (
                        <Flex
                          w="full"
                          h="full"
                          justifyContent="center"
                          alignItems="center"
                          flexDirection={'column'}
                          rowGap={3}
                        >
                          <Spinner />
                          <Text>
                            {functionMessages[Math.floor(Math.random() * 5)]}
                          </Text>
                        </Flex>
                      )}

                      {!isLoadingFunction && (
                        <Flex direction="column" gap={3} h="full">
                          <Flex gap={3}>
                            <Image src="/images/explanation.png" w={6} />
                            <Text fontWeight="bold">Explanation</Text>
                          </Flex>
                          <Text
                            boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
                            borderRadius={16}
                            flex={1}
                            h="full"
                            p={4}
                          >
                            {functionExplanation}
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                  {inspectFunction && address && network && contractABI && (
                    <SimulateTransaction
                      address={address}
                      network={network}
                      contractABI={contractABI}
                      inspectFunction={inspectFunction}
                      userAddress={userAddress}
                      isConnected={isConnected}
                    />
                  )}
                </Flex>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
  )
}
