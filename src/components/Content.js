import { CopyIcon } from '@chakra-ui/icons';
import { Comments } from './Comments';
import { Details } from './Details';
import { Files } from './Files';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useTab,
  TabList,
  Flex,
  Badge,
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
  useClipboard,
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
import { ArrowUpIcon, ChatIcon } from '@chakra-ui/icons';
import { Annotate } from './Annotate';
import { shortenAddress, validateContractAddress } from '../utils/helpers';
import { Network, Alchemy } from 'alchemy-sdk';


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

const dependencyMessages = [
  'Unravelling the dependency',
  'Cracking the dependency',
  'Analyzing the dependency',
  'Interpreting the dependency',
  'Uncovering the dependency',
];

const CustomTab = React.forwardRef((props, ref) => {
  const tabProps = useTab({ ...props, ref })
  const isSelected = !!tabProps['aria-selected']
  const isDisabled = !!tabProps['aria-disabled']
  const bg = isDisabled ? 'red' : isSelected ? '#FFFFFF40' : 'transparent'
  const bgHover = isDisabled ? 'transparent' : '#ffffff40'
  const cursor = isDisabled ? 'not-allowed' : 'pointer'
  return (
    <Button size='sm' w='full' variant='solid' borderRadius='xl' background={bg} cursor={cursor} _hover={{ background: bgHover }} fontWeight={400} isDisabled={isDisabled} {...tabProps}>
      {tabProps.children}
    </Button>
  )
})

export const Content = ({ address, fetching, setFetching }) => {
  const [contractABI, setContractABI] = useState([]);
  const [contractExplanation, setContractExplanation] = useState('');
  const [contractName, setContractName] = useState('No contract');
  const [functionExplanation, setFunctionExplanation] = useState('');
  const [dependencyExplanation, setDependencyExplanation] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const [highlightedFunction, setHighlightedFunction] = useState(null);
  const [selectedFunctionName, setSelectedFunctionName] = useState(null);
  const [selectedFunctionCode, setSelectedFunctionCode] = useState(null);
  const [selectedDependencyName, setSelectedDependencyName] = useState(null);
  const [contractMetadata, setContractMetadata] = useState(null);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [isLoadingFunction, setIsLoadingFunction] = useState(false);
  const [isLoadingDependency, setIsLoadingDependency] = useState(false);
  const [sourceCode, setSourceCode] = useState([]);
  const [inspectContract, setInspectContract] = useState();
  const [inspectFunction, setInspectFunction] = useState({
    name: '',
    code: '',
  });
  const [inspectDependency, setInspectDependency] = useState({
    name: '',
    code: '',
  });
  console.log('inspectContract', inspectContract);
  const { chain } = useNetwork();
  const network = chain?.name?.toLowerCase();
  const { address: userAddress, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { APIKEY, blockExplorerApi, blockExplorerUrl, alchemyUrl, ALCHEMY_API_KEY } = chainInfo({ chain });
  const { onCopy, value, setValue, hasCopied } = useClipboard('');
  const [isFetchingCreator, setIsFetchingCreator] = useState(false);
  const [contractCreation, setContractCreation] = useState({
    creator: '',
    creationTxn: ''
  });
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    message: ''
  });
  const [tokenData, setTokenData] = useState(null)

  const mainContentRef = useRef(null);

  useEffect(() => {
    if (address && address.length > 0) {
      validateContractAddress(address, userAddress, validationResult, setValidationResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain?.id]);



  const explanation = {
    contract: 'contract',
    function: 'function',
    dependency: 'dependency',
  };

  useEffect(() => {
    if (sourceCode && sourceCode.length > 0) {
      setInspectContract(sourceCode[0]);
    }
  }, [sourceCode, chain?.id]);

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
          content = `Give me an advanced level summary of ${code} and analyse if the code has any potential vulnerabilities that could be used for malicious purposes. Please use markdown formatting in all responses`;
          setIsLoadingContract(true);
        } else if (type === explanation.dependency) {
          content = `Give me a simple explanation of the following solidity file or dependency: ${code}`;
          setIsLoadingDependency(true);
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
            if (data.error) {
              let errorMessage = ''
              if (data.error.type === 'context_length_exceeded') {
                errorMessage = 'The contract code is too long.'
                throw new Error(errorMessage);
              } else {
                errorMessage = `Something went wrong. Please try again or check another contract. ${data.error.type}: ${data.error.message}`
                throw new Error(errorMessage);
              }
            }

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

            } else if (type === explanation.dependency) {
              console.log('data.choices[0]', data.choices[0]);
              setDependencyExplanation(data.choices[0].message.content);
              setIsLoadingDependency(false);
            } else {
              console.log('data.choices[0]', data.choices[0]);
              setFunctionExplanation(data.choices[0].message.content);
              setIsLoadingFunction(false);
            }
          })
          .catch((err) => {
            setIsLoadingContract(false);
            setIsLoadingFunction(false);
            setIsLoadingDependency(false);
            setExplanationError(err.message)
            console.log('open ai fetch error', err);
          });
      }
    },
    [explanation.contract, explanation.dependency, inspectContract, address, signer, network, chain?.id]
  );

  function extractContracts(contractString) {
    try {
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

    } catch (error) {
      console.log('Error extracting contracts:', error);
    }
  }

  const fetchCreatorAndCreation = useCallback(
    async (contractAddress) => {
      const apiModule = 'contract';
      const apiAction = 'getcontractcreation';

      try {
        setIsFetchingCreator(true);

        const response = await axios.get(
          `https://${blockExplorerApi}?module=${apiModule}&action=${apiAction}&contractaddresses=${contractAddress}&apikey=${APIKEY}`
        );
        console.log('response', response.data.result);
        setContractCreation({
          creator: response.data.result[0].contractCreator,
          creationTxn: response.data.result[0].txHash,
        })
        setIsFetchingCreator(false);

      } catch (error) {
        console.log('Error fetching contract creation:', error);
        setIsFetchingCreator(false);
        setContractCreation({
          creator: null,
          creationTxn: null,
        })

      }

    }, [APIKEY, blockExplorerApi]);

  useEffect(() => {
    if (address) {
      setFetching(true);
      fetchCreatorAndCreation(address)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, fetchCreatorAndCreation])


  const fetchTokenData = useCallback(async (address) => {
    try {
      const apiUrl = `${alchemyUrl}${ALCHEMY_API_KEY}`;
      console.log('apiUrl', apiUrl);
      if (!address) return null;
      const options = {
        method: 'POST',
        url: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        data: {
          id: chain?.id,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [address],
        }
      }

      const res = await axios(options);
      const {name, logo, symbol} = res.data.result;

      setContractName(name);
      setTokenData({
        name,
        logo,
        symbol,
      });
    } catch (error) {
      console.log('Alchemy error', error);
      setContractName('Unknown');
    }
  }, [ALCHEMY_API_KEY, alchemyUrl, chain?.id]);

  const fetchSourceCode = useCallback(async () => {
    try {
      const resp = await axios.get(
        `https://${blockExplorerApi}?module=contract&action=getsourcecode&address=${address}&apikey=${APIKEY}`
      );
      let sourceObj;
      let contracts;
      let contractsArray;
      if (!resp.data.result[0].SourceCode) {
        const message = `No source code found for ${address}. Are you on the correct network?`;
        setValidationResult({
          isValid: false,
          message: message,
        });
        throw new Error(message);
      }
      console.log('resp.data.result[0].SourceCode', resp.data.result[0].SourceCode);

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
      // console.log('name', contractsArray[0].name);
      setFetching(false);
    } catch (err) {
      // Handle Error Here
      console.log('fetch source code error', err);
      setFetching(false);
      setSourceCode([]);
      setContractName('Unknown');
      setExplanationError('')
      setContractExplanation('');
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
    setExplanationError('')
    setContractExplanation('');
    if (fetching) {
      fetchTokenData(address);
      fetchSourceCode();
    }
  }, [fetching, fetchSourceCode, setFetching, address, chain.id, fetchTokenData]);

  const handleContractChange = useCallback(
    (e) => {
      setContractExplanation('');
      const selectedContract = e.target.querySelector('.dependency-name').innerText || e.target.innerText;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );

      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 50;
      }

      setInspectContract(contract);
      fetchExplanation(contract.sourceCode.content, explanation.contract);
    },
    [explanation.contract, fetchExplanation, sourceCode]
  );

  const handleCodeHover = useCallback(
    (event) => {
      console.log('I am in here')
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

  // const {
  //   isOpen: isOpenDependency,
  //   onOpen: onOpenDependency,
  //   onClose: onCloseDependency,
  // } = useDisclosure();

  const handleCodeClick = useCallback(() => {
    if (!selectedFunctionName || !selectedFunctionCode) {
      return;
    }
    setFunctionExplanation('');

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


  return (
    <Stack h='full' w='full' background="#FFFFFF1A" backdropFilter="blur(8px)" p={6} borderRadius='8px' gap={8} zIndex={0}>
      {!userAddress ? (
        <Box position="absolute" w="screen" h="12" top={0} right={0} zIndex={-1} >
          <Flex alignItems='center' justifyContent='space-around' h="full" p={3} borderRadius="xl" overflow="hidden">
            Connect your wallet to use this dApp. <ArrowUpIcon />
          </Flex>
        </Box>
      ) : undefined}
      <Stack>
        <Flex alignItems='center' gap={2}>
          <Image
            src={'/images/document.svg'}
          />
          {/* This should be the name of the contract address the user plugs in */}
          <Heading as='h1' size='lg' fontWeight={600} noOfLines={1}>{contractName}</Heading>
        </Flex>
        <Flex alignItems='center'>

          {address && userAddress && validationResult.result ? (
            <>
              <Link href={`${blockExplorerUrl}/address/${address}`} fontSize='sm' color='#A4BCFF' isExternal>{address}</Link>
              <Button variant='unstyled' size='sm' onClick={() => {
                setValue(address);
                onCopy(value);
              }}
                position="relative"
              >
                <CopyIcon color='white' /><Badge position="absolute" display="block" top={0} right="auto" transformOrigin="center" transform="translate3d(-25%, -13px, 0)" colorScheme='green' variant="solid" borderRadius="sm">{hasCopied ? 'Copied!' : undefined}</Badge>
              </Button>
            </>
          ) : (
            <Text fontSize='sm'>{!userAddress ? 'Connect your wallet' : !validationResult.result ? 'No valid address' : 'No contract selected'}</Text>
          )}

        </Flex>
        <Heading as='h2' size='md' fontWeight={600} noOfLines={1}>CREATOR</Heading>
        {isFetchingCreator && contractCreation.creator === '' && (<Flex gap={1} alignItems="center"><Spinner size="xs" /> Fetching creator...</Flex>)}
        {!isFetchingCreator && contractCreation.creator && validationResult.result ? (
          <Flex gap={1}>
            <Link
              href={`${blockExplorerUrl}/address/${contractCreation.creator}`}
              fontSize='sm'
              color='#A4BCFF'
              isExternal
            >
              {shortenAddress(contractCreation.creator)}
            </Link>
            <Text fontSize='sm'>at txn</Text>
            <Link
              href={`${blockExplorerUrl}/tx/${contractCreation.creationTxn}`}
              fontSize='sm'
              color='#A4BCFF'
              isExternal
            >
              {shortenAddress(contractCreation.creationTxn)}
            </Link>
          </Flex>
        ) : (
          <Text fontSize='sm'>{!userAddress ? 'Connect your wallet' : !validationResult.result ? 'No valid address' : 'No contract selected'}</Text>
        )}
      </Stack>
      <Files sourceCode={sourceCode} handleClick={handleContractChange} />
      <Flex alignItems='center' w='full' h="lg">
        <Box background='#00000080' w='50%' h='full' p={6} borderTopLeftRadius='lg' borderBottomLeftRadius='lg' onMouseOver={(event) => handleCodeHover(event)}>
          <Heading as='h3' size='md' noOfLines={1} pb={8}>SOURCE CODE</Heading>
          <Box
            h='sm'
            overflow='auto'
          >
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
        <Box ref={mainContentRef} background='#FFFFFF1A' w='50%' h='full' p={6} borderTopRightRadius='lg' borderBottomRightRadius='lg'>
          <Stack spacing={4}>
            <Heading as='h3' size='md' noOfLines={1}>SUMMARY</Heading>
            <Tabs size='sm' variant='unstyled'>
              <TabList border='2px solid #FFFFFF40' borderRadius='2xl' p={1} gap={1}>
                <CustomTab>Beginner</CustomTab>
                <CustomTab isDisabled={true} aria-disabled="true">Intermediate</CustomTab>
                <CustomTab isDisabled={true} aria-disabled="true">Advanced</CustomTab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box h='sm' overflowY='auto' pb={10}>
                    {isLoadingContract && <Box display="flex" flexFlow="column wrap" height="full" maxW="full" alignItems="center" justifyContent="center" rowGap={2}>
                      <Spinner /> <span>{contractMessages[Math.floor(Math.random() * 5)]}</span>
                    </Box>}
                    {contractExplanation && !isLoadingContract && (

                      <Text ml={2} transition="ease-in-out">
                        {contractExplanation}
                      </Text>
                    )}
                    {explanationError !== '' && (
                      <Text ml={2} transition="ease-in-out" color="red.400">
                        {explanationError}
                      </Text>
                    )}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box h='sm' overflowY='auto'>
                    <Text>
                      The intermediate code provided is not related to SPDX-License-Identifier: MIT, but rather an abstract contract called Initializable that aids in writing upgradeable contracts. <br /><br />
                      The purpose of this contract is to provide a modifier called "initializer" that protects an initializer function from being invoked twice. The contract also includes two boolean variables, _initialized and _initializing, that track whether the contract has been initialized or is in the process of being initialized. In terms of potential vulnerabilities, there does not appear to be any immediate concerns with this code. <br /><br />
                      However, as the contract is intended to be used for writing upgradeable contracts, it is important to ensure that any contracts that inherit from this contract are properly designed and tested to avoid any potential security risks. <br /><br />
                      Additionally, care must be taken to avoid invoking a parent initializer twice or ensuring that all initializers are idempotent when using this contract with inheritance.
                    </Text>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box h='sm' overflowY='auto'>
                    <Text>
                      The advanced code provided is not related to SPDX-License-Identifier: MIT, but rather an abstract contract called Initializable that aids in writing upgradeable contracts. <br /><br />
                      The purpose of this contract is to provide a modifier called "initializer" that protects an initializer function from being invoked twice. The contract also includes two boolean variables, _initialized and _initializing, that track whether the contract has been initialized or is in the process of being initialized. In terms of potential vulnerabilities, there does not appear to be any immediate concerns with this code. <br /><br />
                      However, as the contract is intended to be used for writing upgradeable contracts, it is important to ensure that any contracts that inherit from this contract are properly designed and tested to avoid any potential security risks. <br /><br />
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

      <Modal isOpen={isOpenAnnotation} onClose={onCloseAnnotation}>
        <ModalOverlay />
        <ModalContent minW="800px" maxH="calc(100% - 80px)" borderRadius={16}>
          <ModalHeader
            background="#262545"
            mt={2}
            mx={2}
            color="white"
            borderTopRadius={16}
            justifyItems="space-between"
          >
            <code>Annotate contract: {inspectContract?.name}</code>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Annotate address={address} inspectContract={inspectContract} />
          </ModalBody>
        </ModalContent>
      </Modal>

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
            <Box flexGrow={0} w="100%" h="100%" overflowY="auto" pb={8} borderRadius="xl">
              {inspectFunction &&
                Object.values(inspectFunction).every(
                  (value) => !value
                ) ? null : (
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
                            {
                              functionMessages[
                              Math.floor(Math.random() * 5)
                              ]
                            }
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
    </Stack>
  )
}