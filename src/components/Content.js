import { CopyIcon } from '@chakra-ui/icons';
import { Comments } from './Comments';
import { Details } from './Details';
import { Files } from './Files';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import React, { useState, useEffect, useCallback } from 'react';
import {
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	useTab,
	TabList,
  Flex,
  Box,
  Select,
  Spinner,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Code,
	Heading,
	Link,
	Stack,
} from '@chakra-ui/react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SimulateTransaction } from './SimulateTransaction';
import axios from 'axios';
import { uploadJSON } from '../utils/ipfs';
import { useAccount, useSigner, useNetwork } from 'wagmi';
import { getExplanation } from '../utils/queries';
import { ipfsGateway } from '../utils/constants';
import { getContract } from '../utils/contract';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import chainInfo from '../utils/chainInfo';
import { ChatIcon } from '@chakra-ui/icons';
import { Annotate } from './Annotate';

const functionMessages = [
  'Deciphering the function',
  'Unpacking the function',
  'Analyzing the function',
  'Interpreting the function',
  'Uncovering the function',
];

const contractMessages = [
  "Unravelling the contract's source code",
  "Cracking the contract's source code",
  "Decoding the contract's source code",
  "Decrypting the contract's source code",
  "Unveiling the contract's source code",
];

const CustomTab = React.forwardRef((props, ref) => {
	const tabProps = useTab({ ...props, ref })
	const isSelected = !!tabProps['aria-selected']

	return (
		<Button size='sm' w='full' variant='solid' borderRadius='xl' background={isSelected ? '#FFFFFF40' : 'transparent'}  _hover={{ background: '#FFFFFF40' }} fontWeight={400} {...tabProps}>
			{tabProps.children}
		</Button>
	)
})

export const Content = ({ address, fetching, setFetching }) => {
	const [contractABI, setContractABI] = useState([]);
  const [contractExplanation, setContractExplanation] = useState('');
  const [functionExplanation, setFunctionExplanation] = useState('');
  const [highlightedFunction, setHighlightedFunction] = useState(null);
  const [selectedFunctionName, setSelectedFunctionName] = useState(null);
  const [selectedFunctionCode, setSelectedFunctionCode] = useState(null);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [isLoadingFunction, setIsLoadingFunction] = useState(false);
  const [sourceCode, setSourceCode] = useState([]);
  const [inspectContract, setInspectContract] = useState();
  const [inspectFunction, setInspectFunction] = useState({
    name: '',
    code: '',
  });
  console.log('inspectContract', inspectContract);
  const { chain } = useNetwork();
  const network = chain?.name?.toLowerCase();
  const { address: userAddress, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { APIKEY, blockExplorerApi } = chainInfo({ chain });

  const explanation = {
    contract: 'contract',
    function: 'function',
  };

  useEffect(() => {
    if (sourceCode && sourceCode.length > 0) {
      setInspectContract(sourceCode[0]);
    }
  }, [sourceCode]);

  const fetchExplanation = useCallback(
    async (code, type) => {
      const relay = new GelatoRelay();

      const result = await getExplanation(address, inspectContract.name);

      console.log('getExplanation in fetchExplanation', result);

      let fileExplanationSuccess = false;
      // if (result?.length > 0) {
      //   const fileExplanationPromise = new Promise((resolve, reject) => {
      //     axios
      //       .get(ipfsGateway + '/' + result[0].ipfsSchema)
      //       .then((response) => {
      //         console.log('DID IT WORK? ', response.data);
      //         setContractExplanation(response.data.fileExplanation);
      //         resolve(true);
      //       })
      //       .catch((error) => {
      //         console.log(
      //           'Error fetching IPFS content:',
      //           error.response.data.error
      //         );
      //         reject(false);
      //       });
      //   });

      //   fileExplanationSuccess = await fileExplanationPromise;
      // } else {
      //   fileExplanationSuccess = false;
      // }

      console.log('lol');

      let content;
      if (!fileExplanationSuccess) {
        if (type === explanation.contract) {
          content = `Give me an advanced level summary of ${code} and analyse if the code has any potential vulnerabilities that could be used for malicious purposes.`;
          setIsLoadingContract(true);
        } else {
          content = `Give me a simple explanation of the following solidity code: ${code}`;
          setIsLoadingFunction(true);
        }

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY),
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a great teacher.' },
              {
                role: 'user',
                content,
              },
            ],
            temperature: 0.3,
            max_tokens: 3000,
          }),
        };

        console.log('fetchhh');
        fetch('https://api.openai.com/v1/chat/completions', requestOptions)
          .then((response) => response.json())
          .then(async (data) => {
            console.log('data', data);
            if (type === explanation.contract) {
              setContractExplanation(data.choices[0].message.content);
              setIsLoadingContract(false);
              console.log('inspectContract2', inspectContract?.name);
              // console.log('new message', data.choices[0].message.content);
              const uploadResult = await uploadJSON(
                address,
                network,
                inspectContract?.name,
                data.choices[0].message.content
              );
              console.log('uploadResult', uploadResult);
              const smartReader = getContract(network, signer);
              console.log('inspectContract3', inspectContract?.name);
              const { data: sponsoredData } =
                await smartReader.populateTransaction.addContract(
                  address,
                  inspectContract.name,
                  uploadResult
                );

              const sponsoredCallRequest = {
                chainId: chain?.id,
                target: smartReader.address,
                data: sponsoredData,
              };

              const relayResponse = await relay.sponsoredCall(
                sponsoredCallRequest,
                process.env.REACT_APP_GELATO_API_KEY
              );
              console.log('Gelato relay result: ', relayResponse);
            } else {
              console.log('data.choices[0]', data.choices[0]);
              setFunctionExplanation(data.choices[0].message.content);
              setIsLoadingFunction(false);
            }
          })
          .catch((err) => {
            setIsLoadingContract(false);
            setIsLoadingFunction(false);
            console.log('err', err);
          });
      }
    },
    [explanation.contract, inspectContract, address, signer, network, chain?.id]
  );

  function extractContracts(contractString) {
    const contractsArray = [];

    let contractStart = contractString?.indexOf('contract ');
    let braceCount = 0;
    let i = contractStart;

    while (i < contractString.length) {
      if (contractString[i] === '{') {
        braceCount++;
      } else if (contractString[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          contractsArray.push(contractString.slice(contractStart, i + 1));
          contractStart = contractString.indexOf('contract ', i + 1);
        }
      }
      i++;
    }
    const contracts = {};
    Object.entries(contractsArray).forEach(([index, sourceCode]) => {
      const nameStart = sourceCode.indexOf('contract ') + 9;
      const nameEnd = sourceCode.indexOf(' ', nameStart);
      const name = sourceCode.slice(nameStart, nameEnd);

      contracts[name] = { content: sourceCode };
    });

    return contracts;
  }

  const fetchSourceCode = useCallback(async () => {
    try {
      const resp = await axios.get(
        `https://${blockExplorerApi}?module=contract&action=getsourcecode&address=${address}&apikey=${APIKEY}`
      );
      let sourceObj;
      let contracts;
      let contractsArray;
      try {
        sourceObj = JSON.parse(resp.data.result[0].SourceCode.slice(1, -1));

        contracts = sourceObj.sources;
      } catch {
        sourceObj = resp.data.result[0].SourceCode;
        contracts = extractContracts(sourceObj);
      }

      contractsArray = Object.entries(contracts).map(([name, sourceCode]) => {
        return { name, sourceCode };
      });

      const addressABI = JSON.parse(resp.data.result[0].ABI);

      setContractABI(addressABI);
      setSourceCode(contractsArray);
      while (!inspectContract) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      fetchExplanation(
        contractsArray[0].sourceCode.content,
        explanation.contract
      );
      console.log('name', contractsArray[0].name);
      setFetching(false);
    } catch (err) {
      // Handle Error Here
      console.log('fetch source code error', err);
      setFetching(false);
      setSourceCode([]);
      setInspectContract(undefined);
    }
  }, [
    blockExplorerApi,
    inspectContract,
    address,
    APIKEY,
    fetchExplanation,
    explanation.contract,
    setFetching,
  ]);

  useEffect(() => {
		console.log('made it in fetching', fetching)
    if (fetching) {

      fetchSourceCode();
    }
  }, [fetching, fetchSourceCode, setFetching, address]);

  const handleContractChange = useCallback(
    (e) => {
      setContractExplanation('');
      const selectedContract = e.target.value;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );

      setInspectContract(contract);

      fetchExplanation(contract.sourceCode.content, explanation.contract);
    },
    [explanation.contract, fetchExplanation, sourceCode]
  );

  const handleCodeHover = useCallback(
    (event) => {
      const codeNode = event.target;
      const lineNode = codeNode.parentElement;

      if (lineNode.nodeName === 'SPAN') {
        const childSpans = lineNode.querySelectorAll('span');
        childSpans.forEach((span) => {
          let foundFunction = false;
          if (span.innerText.includes('function')) {
            foundFunction = true;
            const codeBlock = lineNode.closest('pre');
            const codeLines = codeBlock.querySelectorAll('span');
            const startIndex = Array.from(codeLines).indexOf(lineNode);
            const closingBraceRegex = /}(\s)*$/;
            let endIndex = startIndex;
            while (!closingBraceRegex.test(codeLines[endIndex].innerText)) {
              endIndex++;
            }
            const highlightedLines = Array.from(codeLines).slice(
              startIndex,
              endIndex + 1
            );
            highlightedLines.forEach((line) => {
              line.classList.add('highlight');
            });
            setHighlightedFunction(highlightedLines);

            const highlightedText = highlightedLines
              .slice(1)
              .map((line) => line.innerText.trim())
              .join('\n');
            setSelectedFunctionCode(highlightedText);
          }
          if (foundFunction) {
            let nextSpan = span.nextElementSibling;
            let functionName = span.innerText.replace(/^.*function\s+/i, '');

            while (nextSpan) {
              const nextText = nextSpan.innerText.trim();
              const openParenIndex = nextText.indexOf('(');
              if (openParenIndex !== -1) {
                functionName += ' ' + nextText.substring(0, openParenIndex);
                break;
              } else if (nextText) {
                functionName += ' ' + nextText;
              }

              nextSpan = nextSpan.nextElementSibling;
            }

            const split = functionName.split(' ');

            if (split[0] === 'function') {
              split.shift();
            }

            let concatenatedFunctionName = '';
            for (let i = 0; i < split.length; i++) {
              if (split[i].includes('(')) {
                concatenatedFunctionName += split[i].split('(')[0];
                break;
              } else {
                concatenatedFunctionName += split[i];
              }
            }
            setSelectedFunctionName(concatenatedFunctionName);
            foundFunction = false;
          }
        });
      } else {
        if (highlightedFunction) {
          highlightedFunction.forEach((line) => {
            line.classList.remove('highlight');
          });
          setHighlightedFunction(null);
        }
      }
    },
    [highlightedFunction]
  );

  const {
    isOpen: isOpenSimulate,
    onOpen: onOpenSimulate,
    onClose: onCloseSimulate,
  } = useDisclosure();
  const {
    isOpen: isOpenAnnotation,
    onOpen: onOpenAnnotation,
    onClose: onCloseAnnotation,
  } = useDisclosure();

  const handleCodeClick = useCallback(() => {
    if (!selectedFunctionName || !selectedFunctionCode) {
      return;
    }

    onOpenSimulate();

    setInspectFunction({
      name: selectedFunctionName,
      code: selectedFunctionCode,
    });
    fetchExplanation(selectedFunctionCode, explanation.function);
    // let formattedCode = '';
    // if (inspectFunction && inspectFunction.code) {
    //   const formattedCode = prettier.format(inspectContract.code, {
    //     parser: 'typescript',
    //     plugins: [typescript],
    //   });
    //
    // }
  }, [
    selectedFunctionName,
    selectedFunctionCode,
    onOpenSimulate,
    fetchExplanation,
    explanation.function,
  ]);

	console.log('in content')
	return (
		<Stack h='full' w='full' background="#FFFFFF1A" backdropFilter="blur(8px)" p={6} borderRadius='8px' gap={8}>
			<Stack>
				<Flex alignItems='center' gap={2}>
					<Image
						src={'/images/document.svg'}
					/>
					<Heading as='h1' size='lg' fontWeight={600} noOfLines={1}>MoonToken</Heading>
				</Flex>
				<Flex alignItems='center'>
					<Link fontSize='sm' color='#A4BCFF'>0x4C0d3F7d561532427A91E671eF1657c9c3e17cAF</Link>
					<Button variant='unstyled' size='sm'>
						<CopyIcon color='white' />
					</Button>
				</Flex>
				<Heading as='h1' size='md' fontWeight={600} noOfLines={1}>CREATOR</Heading>
				<Flex gap={1}>
					<Link fontSize='sm' color='#A4BCFF'>0xbce100...9E4fd09aat</Link> <Text fontSize='sm'>txn</Text> <Link fontSize='sm' color='#A4BCFF'>0x92c6b267070c05800d61</Link>
				</Flex>
			</Stack>
			<Files sourceCode={sourceCode} />
			<Flex alignItems='center' w='full' h="lg">
				<Box background='#00000080' w='full' h='full' p={6} borderTopLeftRadius='lg' borderBottomLeftRadius='lg'>
					<Heading as='h3' size='md' noOfLines={1} pb={8}>SOURCE CODE</Heading>
					<Box h='sm' overflowY='auto'>
						<SyntaxHighlighter
							language="solidity"
							style={{
								...dracula,
								display: 'inline-table',
							}}
							onClick={() => handleCodeClick()}
							wrapLines={true}
						>
							{inspectContract?.sourceCode?.content || ''}
						</SyntaxHighlighter>
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

									{contractExplanation && !isLoadingContract && (
											<Text ml={2}>
											{contractExplanation.replace(/^\n\n/, '')}
											</Text>
										)}
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
			<Comments />
		</Stack>
	)
}