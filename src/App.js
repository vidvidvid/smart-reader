import "./App.css";
import { Box, Input, Select, Flex, Button, Tooltip } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

function App() {
  const [address, setAddress] = useState("");
  const [sourceCode, setSourceCode] = useState("");

  const fetchSourceCode = async () => {
    try {
      const resp = await axios.get(
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=RHDB6C8IZ4K52Q36GSSVBN5GT2256S8N45`
      );
      console.log(JSON.stringify(resp.data, null, 4));
      console.log(resp.data);
      setSourceCode(JSON.parse(resp.data.result));
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  };

  return (
    <Flex direction='column' align='center' justify='center' h='100vh'>
      <Box>
        <Input
          placeholder='Smart contract address'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Select placeholder='Blockchain'>
          <option value='ethereum'>Ethereum</option>
          <option value='polygon'>Polygon</option>
        </Select>

        <Tooltip
          isDisabled={ethers.utils.isAddress(address)}
          label='Please input a valid address'
          shouldWrapChildren
        >
          <Button
            onClick={fetchSourceCode}
            isDisabled={!ethers.utils.isAddress(address)}
          >
            {" "}
            Go{" "}
          </Button>
        </Tooltip>
      </Box>
    </Flex>
  );
}

export default App;
