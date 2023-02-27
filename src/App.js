import './App.css';
import {
  Box,
  Input,
  Select,
  Flex,
  Button,
  Tooltip,
  Text,
} from '@chakra-ui/react';
import { useEffect, useCallback, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function App() {
  const [address, setAddress] = useState('');
  const [sourceCode, setSourceCode] = useState();
  const [inspectContract, setInspectContract] = useState();
  const [fileExplanation, setFileExplanation] = useState('');

  console.log(
    'process.env.REACT_APP_OPENAI_API_KEY',
    process.env.REACT_APP_OPENAI_API_KEY
  );

  useEffect(() => {
    if (sourceCode && sourceCode.length > 0) {
      setInspectContract(sourceCode[0]);
    }
  }, [sourceCode]);

  const fetchExplanation = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY),
      },
      body: JSON.stringify({
        prompt: inspectContract.sourceCode.content.concat(
          '\nProvide the explanation of the solidity code for a beginner programmer:\n\n'
        ),
        temperature: 0.3,
        max_tokens: 1000,
      }),
    };
    fetch(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data.choices[0].text);
        // console.log('data', data.choices[0].text);
        setFileExplanation(data.choices[0].text);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const fetchSourceCode = async () => {
    try {
      const resp = await axios.get(
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=RHDB6C8IZ4K52Q36GSSVBN5GT2256S8N45`
      );
      const sourceObj = JSON.parse(resp.data.result[0].SourceCode.slice(1, -1));
      const contracts = sourceObj.sources;
      const contractsArray = Object.entries(contracts).map(
        ([name, sourceCode]) => {
          return { name, sourceCode };
        }
      );
      setSourceCode(contractsArray);
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  };
  const handleContractChange = useCallback(
    (e) => {
      const selectedContract = e.target.value;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );
      setInspectContract(contract);
    },
    [sourceCode]
  );

  return (
    <Flex direction="column" align="center" justify="center" h="100vh">
      <Box>
        <Input
          placeholder="Smart contract address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Select placeholder="Blockchain">
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
        </Select>

        <Tooltip
          isDisabled={ethers.utils.isAddress(address)}
          label="Please input a valid address"
          shouldWrapChildren
        >
          <Button
            onClick={fetchSourceCode}
            isDisabled={!ethers.utils.isAddress(address)}
          >
            {' '}
            Go{' '}
          </Button>
        </Tooltip>
      </Box>
      <Box>
        <Button onClick={fetchExplanation}>Explain</Button>
      </Box>
      <Select onChange={handleContractChange}>
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
          <Flex overflow="auto" maxH="500px" flexGrow={1} w="50%">
            {/* <h1>Contract Name: {inspectContract.name}</h1> */}
            <SyntaxHighlighter
              children={inspectContract.sourceCode.content}
              language="solidity"
              style={dracula}
              wrapLines={true}
            />
          </Flex>
        ) : (
          'No contract selected'
        )}

        {fileExplanation && (
          <Flex flexGrow={1} w="50%">
            <Text>{fileExplanation}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default App;
