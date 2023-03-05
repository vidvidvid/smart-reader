import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex,
  Box,
  Select,
  Spinner,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { Storage } from './Storage';
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
// import { contractName } from '../utils/ipfs';
import chainInfo from '../utils/chainInfo';

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

// export const Reader = ({ address, network, fetching, setFetching }) => {
export const Reader = ({ address, fetching, setFetching }) => {
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
      const result = await getExplanation(address, inspectContract?.name);
      console.log('getExplanation in fetchExplanation', result);
      let fileExplanationSuccess = false;
      if (result?.length > 0) {
        axios
          .get(ipfsGateway + '/' + result[0].ipfsSchema)
          .then((response) => {
            console.log('DID IT WORK? ', response.data);
            setContractExplanation(response.data.fileExplanation);
            fileExplanationSuccess = true;
          })
          .catch((error) => {
            console.log(
              'Error fetching IPFS content:',
              error.response.data.error
            );
            fileExplanationSuccess = false;
          });
        const fileExplanationPromise = new Promise((resolve, reject) => {
          axios
            .get(ipfsGateway + '/' + result[0].ipfsSchema)
            .then((response) => {
              console.log('DID IT WORK? ', response.data);
              setContractExplanation(response.data.fileExplanation);
              resolve(true);
            })
            .catch((error) => {
              console.log(
                'Error fetching IPFS content:',
                error.response.data.error
              );
              reject(false);
            });
        });

        fileExplanationSuccess = await fileExplanationPromise;
      } else {
        fileExplanationSuccess = false;
      }

      if (!fileExplanationSuccess) {
        if (type === explanation.contract) {
          setIsLoadingContract(true);
        } else {
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
                content: `Give me an advanced level summary of ${code} and analyse if the code has any potential vulnerabilities that could be used for malicious purposes.`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1200,
          }),
        };
        fetch('https://api.openai.com/v1/chat/completions', requestOptions)
          .then((response) => response.json())
          .then(async (data) => {
            console.log('data', data);
            if (type === explanation.contract) {
              setContractExplanation(data.choices[0].message.content);
              setIsLoadingContract(false);
              console.log('inspectContract2', inspectContract?.name);
              const uploadResult = await uploadJSON(
                address,
                network,
                inspectContract?.name,
                data.choices[0].text
              );
              console.log('uploadResult', uploadResult);
              const smartReader = getContract(network, signer);
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
    [
      explanation.contract,
      inspectContract?.name,
      address,
      signer,
      network,
      contractExplanation,
      chain?.id,
    ]
  );

  function extractContracts(contractString) {
    const contractsArray = [];

    let contractStart = contractString.indexOf('contract ');
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

      fetchExplanation(
        contractsArray[0].sourceCode.content,
        explanation.contract
      );
      console.log('name', contractsArray[0].name);
      setFetching(false);
    } catch (err) {
      // Handle Error Here
      setFetching(false);
      setSourceCode([]);
      setInspectContract(undefined);
    }
  }, [
    blockExplorerApi,
    address,
    APIKEY,
    fetchExplanation,
    explanation.contract,
    setFetching,
  ]);

  useEffect(() => {
    if (fetching) {
      fetchSourceCode();
    }
  }, [fetching, fetchSourceCode, setFetching]);

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleCodeClick = useCallback(() => {
    if (!selectedFunctionName || !selectedFunctionCode) {
      return;
    }

    onOpen();

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
    onOpen,
    fetchExplanation,
    explanation.function,
  ]);

  return (
    <Flex
      direction="column"
      h="full"
      pb={3}
      borderBottomRadius={8}
      overflow="hidden"
      maxH="calc(100% - 10px)"
      px={2}
    >
      {!inspectContract && (
        <Flex h="full" alignItems="center" justifyContent="center">
          {fetching ? (
            <Spinner />
          ) : (
            <Text>
              Search for a contract by inputting a contract address & selecting
              the network where it was deployed. 🛠️
            </Text>
          )}
        </Flex>
      )}
      {inspectContract && !fetching && (
        <Flex direction="column" h="full">
          <Select onChange={handleContractChange} my={4}>
            {sourceCode &&
              sourceCode.length > 0 &&
              sourceCode.map((contract) => {
                const contractName = contract.name;

                return (
                  <option key={contractName} value={contractName}>
                    {contractName}
                  </option>
                );
              })}
          </Select>

          <Flex py={3} gap={4} w="full" h="full">
            {inspectContract ? (
              <Flex
                overflow="hidden"
                flexGrow={1}
                w="50%"
                h="100%"
                direction="column"
                gap={3}
                onMouseOver={(event) => handleCodeHover(event)}
              >
                {/* <h1>Contract Name: {inspectContract.name}</h1> */}
                <Flex gap={3}>
                  <Image src="/images/sourcecode.png" w={6} />
                  <Text fontWeight="bold"> Source code </Text>
                </Flex>
                <Flex overflow="auto" h="calc(100% - 84px)" borderRadius={16}>
                  <SyntaxHighlighter
                    language="solidity"
                    style={{
                      ...dracula,
                      display: 'inline-table',
                    }}
                    onClick={() => handleCodeClick()}
                    wrapLines={true}
                  >
                    {inspectContract.sourceCode.content}
                  </SyntaxHighlighter>
                </Flex>
              </Flex>
            ) : (
              'No contract selected'
            )}
            {/* need to condense these into same panel */}
            <Flex
              flexGrow={1}
              w="50%"
              direction="column"
              gap={3}
              // alignSelf="center"
            >
              <Flex gap={3}>
                <Image src="/images/explanation.png" w={6} />
                <Text fontWeight="bold">Explanation</Text>
              </Flex>
              {isLoadingContract && (
                <Flex
                  w="full"
                  justifyContent="center"
                  alignItems="center"
                  h="full"
                >
                  <Spinner />
                  <Text ml={2}>
                    {contractMessages[Math.floor(Math.random() * 5)]}
                  </Text>
                </Flex>
              )}

              {contractExplanation && !isLoadingContract && (
                <Flex direction="column" gap={3}>
                  <Text fontSize={18}>{contractExplanation}</Text>
                </Flex>
              )}
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent
                minW="800px"
                maxH="calc(100% - 80px)"
                borderRadius={16}
              >
                <ModalHeader
                  background="#262545"
                  mt={2}
                  mx={2}
                  color="white"
                  borderTopRadius={16}
                  justifyItems="space-between"
                >
                  <code>Simulate function: {inspectFunction.name}</code>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody py={6}>
                  {inspectFunction &&
                  Object.values(inspectFunction).every(
                    (value) => !value
                  ) ? null : (
                    <Flex flexDirection={'column'} gap={3}>
                      <Flex gap={3}>
                        <Flex
                          flexGrow={1}
                          w="50%"
                          maxH="600px"
                          overflowY="auto"
                          direction="column"
                          gap={3}
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

                        <Box flexGrow={1} w="50%">
                          {isLoadingFunction && (
                            <Flex
                              w="full"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Spinner />
                              <Text ml={2}>
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
                </ModalBody>
              </ModalContent>
            </Modal>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
