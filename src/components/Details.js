
import { Box, Button, Flex, Heading, Stack, TabList, TabPanel, TabPanels, Tabs, Text, useTab } from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import React from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

const markdown = `
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
* @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
* behind a proxy. Since a proxied contract can't have a constructor, it's common to move constructor logic to an
* external initializer function, usually called \`initialize\`. It then becomes necessary to protect this initializer
* function so it can only be called once. The \`initializer\` modifier provided by this contract will have this effect.
*
* TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
* possible by providing the encoded function call as the \`_data\` argument to \`ERC1967Proxy-constructor\`.
*
* CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
* that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
*/
abstract contract Initializable {
	/**
	 * @dev Indicates that the contract has been initialized.
	 */
	bool private _initialized;

	/**
	 * @dev Indicates that the contract is in the process of being initialized.
	 */
	bool private _initializing;

	/**
	 * @dev Modifier to protect an initializer function from being invoked twice.
	 */
	modifier initializer() {
		require(_initializing || !_initialized, "Initializable: contract is already initialized");

		bool isTopLevelCall = !_initializing;
		if (isTopLevelCall) {
			_initializing = true;
			_initialized = true;
		}

		_;

		if (isTopLevelCall) {
			_initializing = false;
		}
	}
}
`

const CustomTab = React.forwardRef((props, ref) => {
	const tabProps = useTab({ ...props, ref })
	const isSelected = !!tabProps['aria-selected']

	return (
		<Button size='sm' w='full' variant='solid' borderRadius='xl' background={isSelected ? '#FFFFFF40' : 'transparent'}  _hover={{ background: '#FFFFFF40' }} fontWeight={400} {...tabProps}>
			{tabProps.children}
		</Button>
	)
})

export const Details = () => {
	return (
		<Flex alignItems='center' w='full' h="lg">
		<Box background='#00000080' w='full' h='full' p={6} borderTopLeftRadius='lg' borderBottomLeftRadius='lg'>
			<Heading as='h3' size='md' noOfLines={1} pb={8}>SOURCE CODE</Heading>
			<Box h='sm' overflowY='auto'>
				<ReactMarkdown components={ChakraUIRenderer()} children={markdown} skipHtml />
			</Box>
		</Box>
		<Box background='#FFFFFF1A' w='full' h='full' p={6}  borderTopRightRadius='lg' borderBottomRightRadius='lg'>
			<Stack spacing={4}>
				<Heading as='h3' size='md' noOfLines={1}>SUMMARY</Heading>
				<Tabs size='sm' variant='unstyled'>
					<TabList border='2px solid #FFFFFF40' borderRadius='2xl' p={1} gap={1}>
						<CustomTab>Beginner</CustomTab>
						<CustomTab>Intermediate</CustomTab>
						<CustomTab>Advanced</CustomTab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Box h='sm' overflowY='auto'>
								<Text>
									The beginner code provided is not related to SPDX-License-Identifier: MIT, but rather an abstract contract called Initializable that aids in writing upgradeable contracts. <br/><br/>
									The purpose of this contract is to provide a modifier called "initializer" that protects an initializer function from being invoked twice. The contract also includes two boolean variables, _initialized and _initializing, that track whether the contract has been initialized or is in the process of being initialized. In terms of potential vulnerabilities, there does not appear to be any immediate concerns with this code. <br/><br/>
									However, as the contract is intended to be used for writing upgradeable contracts, it is important to ensure that any contracts that inherit from this contract are properly designed and tested to avoid any potential security risks. <br/><br/>
									Additionally, care must be taken to avoid invoking a parent initializer twice or ensuring that all initializers are idempotent when using this contract with inheritance.
								</Text>
							</Box>
						</TabPanel>
						<TabPanel>
							<Box h='sm' overflowY='auto'>
								<Text>
									The intermediate code provided is not related to SPDX-License-Identifier: MIT, but rather an abstract contract called Initializable that aids in writing upgradeable contracts. <br/><br/>
									The purpose of this contract is to provide a modifier called "initializer" that protects an initializer function from being invoked twice. The contract also includes two boolean variables, _initialized and _initializing, that track whether the contract has been initialized or is in the process of being initialized. In terms of potential vulnerabilities, there does not appear to be any immediate concerns with this code. <br/><br/>
									However, as the contract is intended to be used for writing upgradeable contracts, it is important to ensure that any contracts that inherit from this contract are properly designed and tested to avoid any potential security risks. <br/><br/>
									Additionally, care must be taken to avoid invoking a parent initializer twice or ensuring that all initializers are idempotent when using this contract with inheritance.
								</Text>
							</Box>
						</TabPanel>
						<TabPanel>
							<Box h='sm' overflowY='auto'>
								<Text>
									The advanced code provided is not related to SPDX-License-Identifier: MIT, but rather an abstract contract called Initializable that aids in writing upgradeable contracts. <br/><br/>
									The purpose of this contract is to provide a modifier called "initializer" that protects an initializer function from being invoked twice. The contract also includes two boolean variables, _initialized and _initializing, that track whether the contract has been initialized or is in the process of being initialized. In terms of potential vulnerabilities, there does not appear to be any immediate concerns with this code. <br/><br/>
									However, as the contract is intended to be used for writing upgradeable contracts, it is important to ensure that any contracts that inherit from this contract are properly designed and tested to avoid any potential security risks. <br/><br/>
									Additionally, care must be taken to avoid invoking a parent initializer twice or ensuring that all initializers are idempotent when using this contract with inheritance.
								</Text>
							</Box>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Stack>
		</Box>
	</Flex>
	)
}