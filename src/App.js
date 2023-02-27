import './App.css';
import { Box, Input, Select, Flex, Button, Tooltip } from '@chakra-ui/react';
import { useEffect, useCallback, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function App() {
  const [address, setAddress] = useState('');
  const [sourceCode, setSourceCode] = useState();
  const [inspectContract, setInspectContract] = useState();

  useEffect(() => {
    if (sourceCode && sourceCode.length > 0) {
      setInspectContract(sourceCode[0]);
    }
  }, [sourceCode]);

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

      {inspectContract ? (
        <div style={{ height: '500px', maxWidth: '95%', overflow: 'auto' }}>
          {/* <h1>Contract Name: {inspectContract.name}</h1> */}
          <SyntaxHighlighter
            children={inspectContract.sourceCode.content}
            language="solidity"
            style={dracula}
            wrapLines={true}
          />
        </div>
      ) : (
        'No contract selected'
      )}
    </Flex>
  );
}

export default App;
