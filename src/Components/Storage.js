import { create } from 'ipfs-http-client';
import { Box, Button, Flex } from '@chakra-ui/react';
import { Buffer } from 'buffer';
import { useState } from 'react';

const Storage = ({ data }) => {
  const { address, fileName, fileExplanation, network } = data;
  const INFURA_ID = process.env.REACT_APP_PROJECT_ID;
  const INFURA_SECRET_KEY = process.env.REACT_APP_PROJECT_KEY;

  const [IPFSPath, setIPFSPath] = useState('');

  // define Buffer

  const auth =
    'Basic ' +
    Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');
  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const contractName = (url) => {
    const start = url.lastIndexOf('/') + 1;
    const end = url.lastIndexOf('.');
    return url.substring(start, end);
  };

  const uploadJSON = async () => {
    const file = new File(
      [
        JSON.stringify({
          address,
          network,
          fileName: contractName(fileName),
          fileExplanation,
        }),
      ],
      'data.json',
      {
        type: 'application/json',
      }
    );
    const added = await client.add(file);
    console.log('added', added);
    setIPFSPath(added.path);
  };

  const readUploadedFile = async () => {
    const file = await client.cat(IPFSPath);
    console.log('file', file);
  };

  return (
    <Flex>
      <Box>Storage</Box>
      <Button
        onClick={() => {
          uploadJSON();
        }}
      >
        Upload JSON
      </Button>
      <Button onClick={readUploadedFile}>ReadJSON</Button>
      (address, network, fileName and fileExplanation)
    </Flex>
  );
};

export default Storage;
