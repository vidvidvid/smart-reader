import React from 'react'
import { Box, Stack, Heading, TabList, Tabs, TabPanels, TabPanel, Text, Spinner, useTab, Button } from '@chakra-ui/react'
import Viewer from '../MarkdownViewer'

const CustomTab = React.forwardRef((props, ref) => {
  const tabProps = useTab({ ...props, ref });
  const isSelected = !!tabProps['aria-selected'];
  const isDisabled = !!tabProps['aria-disabled'];
  const bg = isDisabled ? 'red' : isSelected ? '#FFFFFF40' : 'transparent';
  const bgHover = isDisabled ? 'transparent' : '#ffffff40';
  const cursor = isDisabled ? 'not-allowed' : 'pointer';
  return (
    <Button
      size="sm"
      w="full"
      variant="solid"
      borderRadius="xl"
      background={bg}
      cursor={cursor}
      _hover={{ background: bgHover }}
      fontWeight={400}
      isDisabled={isDisabled}
      {...tabProps}
    >
      {tabProps.children}
    </Button>
  );
});

export default function CodeExplaination({
  contractExplanation,
  isLoadingContract,
  explanationError,
  mainContentRef,
  contractMessages
}) {
  return (
    <Box
      ref={mainContentRef}
      background="#FFFFFF1A"
      w={{ base: 'full', lg: '50%' }}
      h="full"
      p={6}
      borderTopRightRadius="lg"
      borderBottomRightRadius="lg"
    >
      <Stack spacing={4}>
        <Heading as="h3" size="md" noOfLines={1}>
          SUMMARY
        </Heading>
        <Tabs size="sm" variant="unstyled">
          <TabList
            border="2px solid #FFFFFF40"
            borderRadius="2xl"
            p={1}
            gap={1}
          >
            <CustomTab>Beginner</CustomTab>
            <CustomTab isDisabled={true} aria-disabled="true">
              Intermediate
            </CustomTab>
            <CustomTab isDisabled={true} aria-disabled="true">
              Advanced
            </CustomTab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box h="sm" overflowY="auto" pb={10}>
                {isLoadingContract && (
                  <Box
                    display="flex"
                    flexFlow="column wrap"
                    height="full"
                    maxW="full"
                    alignItems="center"
                    justifyContent="center"
                    rowGap={2}
                  >
                    <Spinner />{' '}
                    <span>
                      {contractMessages[Math.floor(Math.random() * 5)]}
                    </span>
                  </Box>
                )}
                {contractExplanation && !isLoadingContract && (
                  <Viewer>{contractExplanation}</Viewer>
                )}
                {explanationError !== '' && (
                  <Text ml={2} transition="ease-in-out" color="red.400">
                    {explanationError}
                  </Text>
                )}
              </Box>
            </TabPanel>
            <TabPanel>
              <Box h="sm" overflowY="auto">
                <Text>
                  The intermediate code provided is not related to
                  SPDX-License-Identifier: MIT, but rather an abstract
                  contract called Initializable that aids in writing
                  upgradeable contracts. <br />
                  <br />
                  The purpose of this contract is to provide a modifier
                  called "initializer" that protects an initializer function
                  from being invoked twice. The contract also includes two
                  boolean variables, _initialized and _initializing, that
                  track whether the contract has been initialized or is in
                  the process of being initialized. In terms of potential
                  vulnerabilities, there does not appear to be any immediate
                  concerns with this code. <br />
                  <br />
                  However, as the contract is intended to be used for
                  writing upgradeable contracts, it is important to ensure
                  that any contracts that inherit from this contract are
                  properly designed and tested to avoid any potential
                  security risks. <br />
                  <br />
                  Additionally, care must be taken to avoid invoking a
                  parent initializer twice or ensuring that all initializers
                  are idempotent when using this contract with inheritance.
                </Text>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box h="sm" overflowY="auto">
                <Text>
                  The advanced code provided is not related to
                  SPDX-License-Identifier: MIT, but rather an abstract
                  contract called Initializable that aids in writing
                  upgradeable contracts. <br />
                  <br />
                  The purpose of this contract is to provide a modifier
                  called "initializer" that protects an initializer function
                  from being invoked twice. The contract also includes two
                  boolean variables, _initialized and _initializing, that
                  track whether the contract has been initialized or is in
                  the process of being initialized. In terms of potential
                  vulnerabilities, there does not appear to be any immediate
                  concerns with this code. <br />
                  <br />
                  However, as the contract is intended to be used for
                  writing upgradeable contracts, it is important to ensure
                  that any contracts that inherit from this contract are
                  properly designed and tested to avoid any potential
                  security risks. <br />
                  <br />
                  Additionally, care must be taken to avoid invoking a
                  parent initializer twice or ensuring that all initializers
                  are idempotent when using this contract with inheritance.
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  )
}
