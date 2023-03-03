import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

const INFURA_ID = process.env.REACT_APP_PROJECT_ID;
const INFURA_SECRET_KEY = process.env.REACT_APP_PROJECT_KEY;

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

export const uploadJSON = async (
  address,
  network,
  fileName,
  fileExplanation
) => {

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
  return added.path;
};

export const readUploadedFile = async (ipfsPath) => {
  const file = await client.cat(ipfsPath);
  console.log('file', file);
};
