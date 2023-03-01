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

export const SimulateTransaction = ({ contractABI, inspectFunction }) => {
  const [simulationValid, setSimulationValid] = useState(false);
  const [functionInputs, setFunctionInputs] = useState([]);
  const { name, code } = inspectFunction;

  useEffect(() => {
    contractABI.forEach((abi) => {
      if (abi.name === name) {
        setSimulationValid(true);
        const { inputs } = abi;
        const inputTypes = inputs.map((input) => input.type);
        setFunctionInputs(inputTypes);
      }
    });
  }, [name, code]);

  return (
    <div style={{ margin: '0 auto' }}>
      <h1>Simulate This Transaction!</h1>
      {simulationValid ? (
        <button>Simulate Transaction</button>
      ) : (
        <p>
          Sorry, this transaction cannot be simulated. The function is either
          internal or private.
        </p>
      )}
    </div>
  );
};

// const approveDai = async () => {
//   // assuming environment variables TENDERLY_USER, TENDERLY_PROJECT and TENDERLY_ACCESS_KEY are set
//   // https://docs.tenderly.co/other/platform-access/how-to-find-the-project-slug-username-and-organization-name
//   // https://docs.tenderly.co/other/platform-access/how-to-generate-api-access-tokens
//   const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;

//   console.time('Simulation');

//   const resp = await axios.post(
//     `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
//     // the transaction
//     {
//       /* Simulation Configuration */
//       save: false, // if true simulation is saved and shows up in the dashboard
//       save_if_fails: false, // if true, reverting simulations show up in the dashboard
//       simulation_type: 'quick', // full or quick (full is default)

//       network_id: '1', // network to simulate on

//       /* Standard EVM Transaction object */
//       from: '0xdc6bdc37b2714ee601734cf55a05625c9e512461',
//       to: '0x6b175474e89094c44da98b954eedeac495271d0f',
//       input:
//         '0x095ea7b3000000000000000000000000f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1000000000000000000000000000000000000000000000000000000000000012b',
//       gas: 8000000,
//       gas_price: 0,
//       value: 0,
//     },
//     {
//       headers: {
//         'X-Access-Key': TENDERLY_ACCESS_KEY as string,
//       },
//     }
//   );
//   console.timeEnd('Simulation');

//   const transcation = resp.data.transaction;
//   console.log(JSON.stringify(transcation, null, 2));

// };

// approveDai();
