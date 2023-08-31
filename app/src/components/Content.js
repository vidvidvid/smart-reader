import { ArrowUpIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useClipboard,
  useDisclosure,
  useTab,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useAccount, useNetwork, useWalletClient } from 'wagmi';
import chainInfo from '../utils/chainInfo';
import { contractsDatabase } from '../utils/constants';
import { shortenAddress, validateContractAddress } from '../utils/helpers';
import { isContract } from '../utils/helpers.js';
import { useSupabase } from '../utils/supabaseContext';
import { Annotate } from './Annotate';
import { Comments } from './Comments';
import { Files } from './Files';
import { SimulateTransaction } from './SimulateTransaction';

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
  const { chain } = useNetwork();
  const network = chain?.name?.toLowerCase();
  const { address: userAddress, isConnected } = useAccount();
  const { data: signer } = useWalletClient();
  const { APIKEY, blockExplorerApi, blockExplorerUrl } = chainInfo({ chain });
  const { onCopy, value, setValue, hasCopied } = useClipboard('');
  const [isFetchingCreator, setIsFetchingCreator] = useState(false);
  const [contractCreation, setContractCreation] = useState({
    creator: '',
    creationTxn: '',
  });
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    message: '',
  });
  const mainContentRef = useRef(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    if (address && address.length > 0) {
      validateContractAddress(
        address,
        userAddress,
        validationResult,
        setValidationResult
      );
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
      // console.log('sourceCode', sourceCode);
      const name = sourceCode[0].name ?? 'Name not found';

      fetchExplanation(
        sourceCode[0].sourceCode.content,
        // contractsArray[0].sourceCode.content,
        explanation.contract
      );
      const contractDisplayName = name.substring(name.lastIndexOf('/') + 1);
      setContractName(contractDisplayName);
    }
  }, [sourceCode, chain?.id]);

  // useEffect(() => {
  //   if (sourceCode && sourceCode.length > 0) {
  //     fetchExplanation(
  //       sourceCode[0].sourceCode.content,
  //       // contractsArray[0].sourceCode.content,
  //       explanation.contract
  //     );
  //   }
  // }, [sourceCode]);

  const fetchExplanation = useCallback(
    async (code, type, arrayId = '') => {
      // const relay = new GelatoRelay();

      // const result = await getExplanation(address, inspectContract.name);

      // console.log('getExplanation in fetchExplanation', result);

      let fileExplanationSuccess = false;

      // check if the explanation exists in the db
      const id = chain.id + '-' + address;
      const { data: supabaseResponse, error } = await supabase
        .from(contractsDatabase)
        .select('*')
        .eq('contract_id', id);

      // Handle error during lookup
      if (error && !supabaseResponse) {
        console.log('Error: ', error);
        return;
      }
      if (supabaseResponse.length > 0) {
        let requiredField;
        if (type === explanation.contract) {
          requiredField = 'contract_explanation';
          setIsLoadingContract(true);
          if (supabaseResponse[0][requiredField] !== null) {
            console.log('Contract explanation exists');
            setContractExplanation(supabaseResponse[0][requiredField]);
            setIsLoadingContract(false);
            fileExplanationSuccess = true;
          }
        } else if (type === explanation.dependency) {
          requiredField = 'dependency_explanations';
          setIsLoadingDependency(true);
          if (
            supabaseResponse[0][requiredField] !== null &&
            supabaseResponse[0][requiredField][arrayId] != null
          ) {
            console.log('Contract explanation exists');
            setDependencyExplanation(supabaseResponse[0][requiredField][code]);
            setIsLoadingDependency(false);
            fileExplanationSuccess = true;
          }
        } else {
          requiredField = 'function_explanations';
          setIsLoadingFunction(true);
          if (
            supabaseResponse[0][requiredField] !== null &&
            supabaseResponse[0][requiredField][arrayId] !== null
          ) {
            setFunctionExplanation(supabaseResponse[0][requiredField][arrayId]);
            setIsLoadingFunction(false);
            fileExplanationSuccess = true;
          }
        }
      }
      if (!fileExplanationSuccess) {
        let content;
        let requiredField;
        if (type === explanation.contract) {
          requiredField = 'contract_explanation';
          content = `Give me an advanced level summary of ${code} and analyse if the code has any potential vulnerabilities that could be used for malicious purposes. Please use markdown formatting in all responses`;
          setIsLoadingContract(true);
        } else if (type === explanation.dependency) {
          requiredField = 'dependency_explanations';
          content = `Give me a simple explanation of the following solidity file or dependency: ${code}`;
          setIsLoadingDependency(true);
        } else {
          requiredField = 'function_explanations';
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

        fetch('https://api.openai.com/v1/chat/completions', requestOptions)
          .then((response) => response.json())
          .then(async (data) => {
            console.log('data', data);
            if (data.error) {
              let errorMessage = '';
              if (data.error.type === 'context_length_exceeded') {
                errorMessage = 'The contract code is too long.';
                throw new Error(errorMessage);
              } else {
                errorMessage = `Something went wrong. Please try again or check another contract. ${data.error.type}: ${data.error.message}`;
                throw new Error(errorMessage);
              }
            }
            const contract = {
              contract_id: chain.id + '-' + address,
            };
            if (type === explanation.contract) {
              setContractExplanation(data.choices[0].message.content);
              setIsLoadingContract(false);
              // insert the new explanation into the database
              console.log('updating database');
              contract['contract_explanation'] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update

              if (updateError && !updatedData) {
                console.log('Update Error: ', updateError);
                return;
              }

              console.log('Item updated!', updatedData);
              // const uploadResult = await uploadJSON(
              //   address,
              //   network,
              //   inspectContract?.name,
              //   data.choices[0].message.content
              // );
              // console.log('uploadResult', uploadResult);
              // const smartReader = getContract(network, signer);
              // const { data: sponsoredData } =
              //   await smartReader.populateTransaction.addContract(
              //     address,
              //     inspectContract.name,
              //     uploadResult
              //   );

              // const sponsoredCallRequest = {
              //   chainId: chain?.id,
              //   target: smartReader.address,
              //   data: sponsoredData,
              // };

              // const relayResponse = await relay.sponsoredCall(
              //   sponsoredCallRequest,
              //   process.env.REACT_APP_GELATO_API_KEY
              // );
              // console.log('Gelato relay result: ', relayResponse);
            } else if (type === explanation.dependency) {
              console.log('data.choices[0]', data.choices[0]);
              setDependencyExplanation(data.choices[0].message.content);
              contract[requiredField] = supabaseResponse[0][requiredField];
              if (contract.requiredField === null) {
                contract[requiredField] = {};
              }
              contract[requiredField][arrayId] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update

              if (updateError && !updatedData) {
                console.log('Update Error: ', updateError);
                return;
              }

              console.log('Item updated!', updatedData);
              setIsLoadingDependency(false);
            } else {
              setFunctionExplanation(data.choices[0].message.content);
              // contract[requiredField] = supabaseResponse[0][requiredField];
              if (
                !contract[requiredField] ||
                contract[requiredField] === null
              ) {
                contract[requiredField] = {};
              }
              contract[requiredField][arrayId] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update

              if (updateError && !updatedData) {
                console.log('Update Error: ', updateError);
                return;
              }

              console.log('Item updated!', updatedData);
              setIsLoadingFunction(false);
            }
          })
          .catch((err) => {
            setIsLoadingContract(false);
            setIsLoadingFunction(false);
            setIsLoadingDependency(false);
            setExplanationError(err.message);
            console.log('open ai fetch error', err);
          });
      }
    },
    [
      explanation.contract,
      explanation.dependency,
      inspectContract,
      address,
      signer,
      network,
      chain?.id,
    ]
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

  async function createItemIfNotExists(
    database,
    id,
    idName,
    requiredFields,
    setFunctions,
    createFunction
  ) {
    // Check if item exists
    console.log('Checking if item exists in database ', id);
    const { data, error } = await supabase
      .from(database)
      .select('*')
      .eq(idName, id);

    // Handle error during lookup
    if (error && !data) {
      console.log('Error: ', error);
      return;
    }

    // If the item exists, update it
    if (data.length > 0) {
      console.log('Item exists!', data);
      // TODO add logic for checking last update and only updating if it's been more than a set period of time
      let allFieldsExist = true; // Initialize flag
      // data[0]; // Get first item in array
      for (let i = 0; i < requiredFields.length; i++) {
        if (
          data &&
          data[0] &&
          data[0].hasOwnProperty(requiredFields[i]) &&
          (data[0][requiredFields[i]] === null ||
            Object.keys(data[0][requiredFields[i]]).length === 0)
        ) {
          allFieldsExist = false;
          console.log('Object is empty');
          break;
        }
        // if (!data[0].hasOwnProperty(requiredFields[i])) {
        //   allFieldsExist = false;
        //   break;
        // }
        // if (Object.keys(data[0][requiredFields[i]]).length === 0) {
        //   allFieldsExist = false;
        //   console.log('Object is empty');
        //   break;
        // }
      }
      // console.log('All fields exist');

      if (allFieldsExist) {
        for (let i = 0; i < setFunctions.length; i++) {
          setFunctions[i](data[0][requiredFields[i]]);
        }
        return data[0];
      } else {
        console.log('Not all fields exist');
      }
      const item = await createFunction();
      const { data: updatedData, error: updateError } = await supabase
        .from(database)
        .update(item)
        .eq(idName, id);
      // Handle error during update

      if (updateError && !updatedData) {
        console.log('Update Error: ', updateError);
        return;
      }

      console.log('Item updated!', updatedData);
    }
    // If the item does not exist, insert it
    else {
      console.log('Item does not exist');
      const item = await createFunction();
      const { data: insertedData, error: insertError } = await supabase
        .from(database)
        .insert([item]);
      // Handle error during insert
      if (insertError && !insertedData) {
        console.log('Insert Error: ', insertError);
        return;
      }

      console.log('Item inserted!', insertedData);
    }
  }

  const fetchCreatorAndCreation = useCallback(async () => {
    if (!userAddress || userAddress === '') return;
    if (!address) return;
    if (!(await isContract(address))) return;

    await createItemIfNotExists(
      contractsDatabase,
      chain.id + '-' + address,
      'contract_id',
      ['creation_info'],
      [setContractCreation],
      async () => {
        const apiModule = 'contract';
        const apiAction = 'getcontractcreation';
        let creationInfo = {
          creator: '',
          creationTxn: '',
        };
        try {
          setIsFetchingCreator(true);
          const response = await axios.get(
            `https://${blockExplorerApi}?module=${apiModule}&action=${apiAction}&contractaddresses=${address}&apikey=${APIKEY}`
          );
          // setContractCreation({
          //   creator: response.data.result[0].contractCreator,
          //   creationTxn: response.data.result[0].txHash,
          // });

          creationInfo = {
            creator: response.data.result[0].contractCreator,
            creationTxn: response.data.result[0].txHash,
          };
          // setIsFetchingCreator(false);
          // return creationInfo;
          // setIsFetchingCreator(false);
        } catch (error) {
          console.log('Error fetching contract creation:', error);

          // const creationInfo = {
          //   creator: null,
          //   creationTxn: null,
          // };
          // const contract = {
          //   contract_id: chain.id + '-' + address,
          //   creation_info: creationInfo,
          // };
          // setIsFetchingCreator(false);
          // return contract;
          // setContractCreation();
        }

        const contract = {
          contract_id: chain.id + '-' + address,
          creation_info: creationInfo,
        };

        setIsFetchingCreator(false);
        return contract;
      }
    );
  }, [address, blockExplorerApi, chain, APIKEY]);

  useEffect(() => {
    if (address) {
      setFetching(true);
      fetchCreatorAndCreation(address);
    }
  }, [address, fetchCreatorAndCreation]);

  const fetchSourceCode = useCallback(async () => {
    if (!userAddress || userAddress === '') return;
    if (!(await isContract(address))) return;

    await createItemIfNotExists(
      contractsDatabase,
      chain.id + '-' + address,
      'contract_id',
      ['source_code', 'abi'],
      [setSourceCode, setContractABI],
      async () => {
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
          try {
            sourceObj = JSON.parse(resp.data.result[0].SourceCode.slice(1, -1));

            contracts = sourceObj.sources;
          } catch {
            sourceObj = resp.data.result[0].SourceCode;
            contracts = extractContracts(sourceObj);
          }

          contractsArray = Object.entries(contracts).map(
            ([name, sourceCode]) => {
              return { name, sourceCode };
            }
          );
          const addressABI = JSON.parse(resp.data.result[0].ABI);

          // setContractABI(addressABI);
          // setSourceCode(contractsArray);

          const contract = {
            contract_id: chain.id + '-' + address,
            source_code: contractsArray,
            abi: addressABI,
          };
          // while (!inspectContract) {
          //   // console.log('In here');
          //   await new Promise((resolve) => setTimeout(resolve, 100));
          // }

          fetchExplanation(
            contractsArray[0].sourceCode.content,
            explanation.contract
          );
          // console.log('name', contractsArray[0].name);
          setFetching(false);
          return contract;
        } catch (err) {
          // Handle Error Here
          console.log('fetch source code error', err);
          setFetching(false);
          setSourceCode([]);
          setContractName('Contract name');
          setExplanationError('');
          setContractExplanation('');
          setInspectContract(undefined);
        }
      }
    );
  }, [address]);

  useEffect(() => {
    setExplanationError('');
    setContractExplanation('');
    if (fetching) {
      fetchSourceCode();
    }
  }, [fetching, fetchSourceCode, setFetching, address, chain?.id]);

  const handleContractChange = useCallback(
    (e) => {
      setContractExplanation('');
      const selectedContract =
        e.target.querySelector('.dependency-name').innerText ||
        e.target.innerText;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );
      setContractName(selectedContract);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 50;
      }

      setInspectContract(contract);
      fetchExplanation(
        contract.sourceCode.content,
        explanation.contract,
        contract.name
      );
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
    fetchExplanation(
      selectedFunctionCode,
      explanation.function,
      selectedFunctionName
    );
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
    <Stack
      h="full"
      w="full"
      background="#FFFFFF1A"
      backdropFilter="blur(8px)"
      p={6}
      borderRadius="8px"
      gap={8}
      zIndex={0}
    >
      {!userAddress ? (
        <Box
          position="absolute"
          w="screen"
          h="12"
          top={0}
          right={0}
          zIndex={-1}
        >
          <Flex
            alignItems="center"
            justifyContent="space-around"
            h="full"
            p={3}
            borderRadius="xl"
            overflow="hidden"
          >
            Connect your wallet to use this dApp. <ArrowUpIcon />
          </Flex>
        </Box>
      ) : undefined}
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
                {address}
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
        {/* {isFetchingCreator ||
          !contractCreation ||
          (contractCreation.creator === '' && (
            <Flex gap={1} alignItems="center">
              <Spinner size="xs" /> Fetching creator...
            </Flex>
          ))} */}
        {/* {contractCreation && contractCreation.creator !== '' && (
          <Text fontSize="sm">
            {!userAddress
              ? 'Connect your wallet'
              : !validationResult.result
              ? 'No valid address'
              : 'No contract selected'}
          </Text>
        )} */}

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
      <Files
        sourceCode={sourceCode}
        selectedContract={contractName}
        handleClick={handleContractChange}
      />
      <Flex alignItems="center" w="full" h="lg">
        <Box
          background="#00000080"
          w="50%"
          h="full"
          p={6}
          borderTopLeftRadius="lg"
          borderBottomLeftRadius="lg"
          onMouseOver={(event) => handleCodeHover(event)}
        >
          <Heading as="h3" size="md" noOfLines={1} pb={8}>
            SOURCE CODE
          </Heading>
          <Box h="sm" overflow="auto">
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
        <Box
          ref={mainContentRef}
          background="#FFFFFF1A"
          w="50%"
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
      </Flex>

      <Comments chainId={chain?.id} contractAddress={address} />

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
    </Stack>
  );
};
