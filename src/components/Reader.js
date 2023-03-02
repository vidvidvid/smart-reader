import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex,
  Box,
  Select,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Storage } from './Storage';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SimulateTransaction } from './SimulateTransaction';
import axios from 'axios';

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

export const Reader = ({ address, network, fetching, setFetching }) => {
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
      console.log('code', code);
      console.log('type', type);
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
          prompt: code.concat(
            '\nProvide the explanation of the solidity code for a beginner programmer:\n\n'
          ),
          temperature: 0.3,
          max_tokens: 500,
        }),
      };
      fetch(
        'https://api.openai.com/v1/engines/text-davinci-003/completions',
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          if (type === explanation.contract) {
            setContractExplanation(data.choices[0].text);
            setIsLoadingContract(false);
          } else {
            setFunctionExplanation(data.choices[0].text);
            setIsLoadingFunction(false);
          }
        })
        .catch((err) => {
          setIsLoadingContract(false);
          setIsLoadingFunction(false);
          console.log('err', err);
        });
    },
    [explanation.contract]
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
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=RHDB6C8IZ4K52Q36GSSVBN5GT2256S8N45`
      );
      let sourceObj;
      let contracts;
      let contractsArray;
      try {
        sourceObj = JSON.parse(resp.data.result[0].SourceCode.slice(1, -1));

        contracts = sourceObj.sources;
        console.log('lendingcontracts', contracts);
      } catch {
        sourceObj = resp.data.result[0].SourceCode;
        contracts = extractContracts(sourceObj);
      }
      console.log('contracts', contracts);

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
    } catch (err) {
      // Handle Error Here
      console.error(err);
      setSourceCode([]);
      setInspectContract(undefined);
    }
  }, [address, explanation.contract, fetchExplanation]);

  useEffect(() => {
    if (fetching) {
      fetchSourceCode();
      setFetching(false);
    }
  }, [fetching, fetchSourceCode, setFetching]);

  const handleContractChange = useCallback(
    (e) => {
      setContractExplanation('');
      const selectedContract = e.target.value;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );
      console.log('Selected contract:', contract);

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
    //   console.log('formattedCode', formattedCode);
    // }
  }, [
    selectedFunctionName,
    selectedFunctionCode,
    onOpen,
    fetchExplanation,
    explanation.function,
  ]);

  return (
    <Flex pt={16} direction="column">
      {fetching && (
        <Flex>
          <Spinner />
        </Flex>
      )}
      {!fetching && inspectContract && (
        <Flex direction="column">
          {/* <Flex>
            <Button
              onClick={() =>
                fetchExplanation(
                  inspectContract.sourceCode.content,
                  explanation.contract
                )
              }
            >
              Explain Contract
            </Button>
            <Button onClick={() => setContractExplanation('')}>
              Clear Explanation
            </Button>
            <Button onClick={() => setInspectFunction({ name: '', code: '' })}>
              Clear Function
            </Button>
          </Flex> */}
          <Storage
            address={address}
            network={network}
            fileName={inspectContract?.name}
            fileExplanation={contractExplanation}
          />
          <Select onChange={handleContractChange}>
            {/* {console.log("SRC", sourceCode[0].sourceCode)} */}
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

          <Flex p={3} gap={3} w="full">
            {inspectContract ? (
              <Flex
                overflow="auto"
                maxH="calc(100vh - 180px)"
                flexGrow={1}
                w="50%"
                onMouseOver={(event) => handleCodeHover(event)}
              >
                {/* <h1>Contract Name: {inspectContract.name}</h1> */}
                <SyntaxHighlighter
                  language="solidity"
                  style={dracula}
                  onClick={() => handleCodeClick()}
                  wrapLines={true}
                >
                  {inspectContract.sourceCode.content}
                </SyntaxHighlighter>
              </Flex>
            ) : (
              'No contract selected'
            )}
            {/* need to condense these into same panel */}
            <Flex flexGrow={1} w="50%">
              {isLoadingContract && (
                <Flex w="full" justifyContent="center" alignItems="center">
                  <Spinner />
                  <Text ml={2}>
                    {contractMessages[Math.floor(Math.random() * 5)]}
                  </Text>
                </Flex>
              )}

              {contractExplanation && (
                <Text fontSize={18}>{contractExplanation}</Text>
              )}
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{inspectFunction.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody py={6}>
                  {inspectFunction &&
                  Object.values(inspectFunction).every(
                    (value) => !value
                  ) ? null : (
                    <Flex flexDirection={'column'} gap={3}>
                      {isLoadingFunction && (
                        <Flex
                          w="full"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Spinner />
                          <Text ml={2}>
                            {functionMessages[Math.floor(Math.random() * 5)]}
                          </Text>
                        </Flex>
                      )}
                      <Box>
                        <Text>{functionExplanation}</Text>
                      </Box>
                      <SyntaxHighlighter
                        language="solidity"
                        style={dracula}
                        wrapLines={true}
                      >
                        {inspectFunction.code ? inspectFunction.code : ''}
                      </SyntaxHighlighter>
                      {inspectFunction && address && network && contractABI && (
                        <SimulateTransaction
                          address={address}
                          network={network}
                          contractABI={contractABI}
                          inspectFunction={inspectFunction}
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
