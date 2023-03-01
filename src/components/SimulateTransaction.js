import axios from 'axios';
import {
  Box,
  Input,
  Select,
  Flex,
  Button,
  Tooltip,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const SimulateTransaction = ({
  network,
  contractABI,
  inspectFunction,
}) => {
  const [simulationValid, setSimulationValid] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);

  const [functionInputs, setFunctionInputs] = useState([]);
  const [encodedInput, setEncodedInput] = useState('');
  const [inputTypeError, setInputTypeError] = useState(false);
  const [txnTo, setTxnTo] = useState('');
  const [txnFrom, setTxnFrom] = useState('');

  const { name, code } = inspectFunction;
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
      Object.values(functionInputs).forEach((param) => {
        if (param.value.length > 0 && !inputTypeError) {
          setSimulationReady(true);
        } else {
          setSimulationReady(false);
        }
      });
    }
  }, [functionInputs, inputTypeError]);

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
        if (abi.name && abi.name.toLowerCase() === name.toLowerCase()) {
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
        to: txnTo,
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

  const handleAddressInputChange = (e, setInputTypeError) => {
    const inputValue = e.target.value;
    if (!ethers.utils.isAddress(inputValue)) {
      setInputTypeError(inputValue.length > 0);
    } else {
      setInputTypeError(false);
    }
    return inputValue;
  };
  console.log('txnFrom', txnFrom);
  console.log('txnTo', txnTo);
  return (
    <div style={{ margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Simulate This Transaction!
      </h1>
      {simulationValid ? (
        <Box>
          Simluating this transaction on: {network}
          <hr />
          <Box style={{border: '10px red solid'}}>
            <i>These inputs are ideally temporary, as from/to should ideally be abstracted. There are no checks on these address for simulation readiness.</i>
            <hr style={{borderBottom: "5px solid red" }} />
            Transaction from:
            <Input
              value={txnFrom}
              onChange={(e) =>
                setTxnFrom(handleAddressInputChange(e, setInputTypeError))
              }
              borderColor={inputTypeError ? 'red' : 'gray.300'}
              _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
            />
            Transaction To:
            <Input
              value={txnTo}
              onChange={(e) =>
                setTxnTo(handleAddressInputChange(e, setInputTypeError))
              }
              borderColor={inputTypeError ? 'red' : 'gray.300'}
              _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
            />
          </Box>
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
            Simulation Transaction
          </Button>
        </Box>
      ) : (
        <p>
          This transaction cannot be simulated. The function is either internal
          or private.
        </p>
      )}
    </div>
  );
};
