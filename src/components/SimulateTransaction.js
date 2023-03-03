import axios from 'axios';
import { Box, Input, Button, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const SimulateTransaction = ({
  address,
  network,
  contractABI,
  inspectFunction,
  userAddress,
  isConnected,
}) => {
  const [simulationValid, setSimulationValid] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);

  const [functionInputs, setFunctionInputs] = useState([]);
  const [encodedInput, setEncodedInput] = useState('');
  const [inputTypeError, setInputTypeError] = useState(false);
  const [txnFrom, setTxnFrom] = useState(isConnected ? userAddress : '');
  console.log('userAddress', userAddress);
  console.log('isConnected', isConnected);

  const { name, code } = inspectFunction;
  console.log('code', code);
  const {
    REACT_APP_TENDERLY_USER,
    REACT_APP_TENDERLY_PROJECT,
    REACT_APP_TENDERLY_ACCESS_KEY,
  } = process.env;

  const chainId = {
    ethereum: 1,
    polygon: 137,
  };

  useEffect(() => {
    if (functionInputs) {
      console.log('functionInputs', functionInputs);
      const inputValues = Object.values(functionInputs);
      if (inputValues.length === 0) {
        setSimulationReady(true);
      } else {
        let ready = true;
        inputValues.forEach((param) => {
          if (param.value.length === 0 || inputTypeError) {
            ready = false;
          }
        });
        setSimulationReady(ready);
      }
    }
  }, [functionInputs, inputTypeError]);

  // useEffect(() => {
  //   if (functionInputs || txnFrom) {
  //     // if each of the functionInputs has a value, and txnFrom is a valid address, then set simulationReady to true
  //     if (
  //       Object.values(functionInputs).every(
  //         (param) => param.value.length > 0
  //       ) &&
  //       ethers.utils.isAddress(txnFrom)
  //     ) {
  //       setSimulationReady(true);
  //     } else {
  //       setSimulationReady(false);
  //     }
  //   }
  // }, [functionInputs, inputTypeError, txnFrom]);

  useEffect(() => {
    if (simulationReady) {
      const inputTypes = Object.values(functionInputs).map(
        (param) => param.type
      );

      const inputValues = Object.values(functionInputs).map(
        (param) => param.value
      );

      if (inputValues.some((value) => value === '')) {
        setEncodedInput('');
        setSimulationReady(false);
        return;
      }

      const encodedParams = ethers.utils.defaultAbiCoder.encode(
        inputTypes,
        inputValues
      );

      setEncodedInput(encodedParams);
    }
  }, [encodedInput, functionInputs, simulationReady]);

  useEffect(() => {
    if (name && contractABI) {
      contractABI.forEach((abi) => {
        if (
          abi.name &&
          abi.name.toLowerCase().trim() === name.toLowerCase().trim()
        ) {
          console.log('aib.name', abi.name, 'name', name);
          setSimulationValid(true);
          const { inputs } = abi;
          const inputsObj = inputs.reduce((params, input) => {
            params[input.name] = { type: input.type, value: '' };
            return params;
          }, {});
          setFunctionInputs(inputsObj);
        }
      });
    }
  }, [name, contractABI]);
  const transaction = async () => {
    console.log('encodedInput', encodedInput);
    console.time('Simulation');
    // network selector
    // map inputs
    // encode inputs
    // how to set from field, maybe ERC@) or not at this point(?)

    const resp = await axios.post(
      `https://api.tenderly.co/api/v1/account/${REACT_APP_TENDERLY_USER}/project/${REACT_APP_TENDERLY_PROJECT}/simulate`,
      // the transaction
      {
        /* Simulation Configuration */
        save: false, // if true simulation is saved and shows up in the dashboard
        save_if_fails: false, // if true, reverting simulations show up in the dashboard
        simulation_type: 'full', // full or quick (full is default)

        network_id: chainId[network], // network to simulate on

        /* Standard EVM Transaction object */
        // for testing
        // from: '0xdc6bdc37b2714ee601734cf55a05625c9e512461',
        // to: '0x6b175474e89094c44da98b954eedeac495271d0f',
        from: txnFrom,
        to: address,
        input: encodedInput,
        gas: 8000000,
        gas_price: 0,
        value: 0,
      },
      {
        headers: {
          'X-Access-Key': REACT_APP_TENDERLY_ACCESS_KEY,
        },
      }
    );
    console.timeEnd('Simulation');

    const transcation = resp.data.transaction;
    console.log('RETURN TXN', JSON.stringify(transcation, null, 2));
  };
  console.log('address', address);
  const handleAddressInputChange = (e, setInputTypeError) => {
    const inputValue = e.target.value;
    if (!ethers.utils.isAddress(inputValue)) {
      setInputTypeError(inputValue.length > 0);
    } else {
      setInputTypeError(false);
    }
    return inputValue;
  };

  return (
    <Flex direction="column">
      {simulationValid ? (
        <Flex direction="column" gap={3}>
          <h1 style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Simulate This Transaction on {network}
          </h1>
          <hr />
          <Flex gap={2} direction="column">
            <i>which account is sending this txn?</i>
            <Text>Transaction from:</Text>
            <Input
              value={txnFrom}
              onChange={(e) =>
                setTxnFrom(handleAddressInputChange(e, setInputTypeError))
              }
              borderColor={inputTypeError ? 'red' : 'gray.300'}
              _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
            />
          </Flex>
          {Object.keys(functionInputs).map((key, index) => (
            <Box key={index}>
              Param: {key} Type: {functionInputs[key].type}
              <Input
                value={functionInputs[key].value}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  switch (functionInputs[key].type) {
                    case 'address':
                      if (!ethers.utils.isAddress(inputValue)) {
                        setInputTypeError(inputValue.length > 0);
                      } else {
                        setInputTypeError(false);
                      }
                      break;
                    case 'uint256':
                      if (!/^\d+$/.test(inputValue)) {
                        setInputTypeError(inputValue.length > 0);
                      } else {
                        setInputTypeError(false);
                      }
                      break;
                    default:
                      setInputTypeError(false);
                      break;
                  }
                  setFunctionInputs({
                    ...functionInputs,
                    [key]: { ...functionInputs[key], value: inputValue },
                  });
                }}
                borderColor={inputTypeError ? 'red' : 'gray.300'}
                _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
              />
            </Box>
          ))}
          <Button isDisabled={!simulationReady} onClick={transaction}>
            Simulate Transaction
          </Button>
        </Flex>
      ) : (
        <p>
          This transaction cannot be simulated. The function is either internal
          or private.
        </p>
      )}
    </Flex>
  );
};
