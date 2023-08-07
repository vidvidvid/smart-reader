import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  Button,
  Flex,
  Heading,
  Input,
  List,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from './Comment';
import Cookies from 'js-cookie';
import postData from '../utils/api.js';
import { useSupabase } from '../utils/supabaseContext';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
// import { Button, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useSignMessage } from 'wagmi';
import { setCookie } from 'typescript-cookie';
import jwtDecode from 'jwt-decode';
import { formatDistanceToNow } from 'date-fns';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const examplecomments = [
  {
    name: 'amyrobson',
    timeAgo: '1 month ago',
    upvotes: 12,
    message:
      'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
    ref: true,
  },
  {
    name: 'amyrobson',
    timeAgo: '1 month ago',
    upvotes: 12,
    message:
      'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
    ref: false,
  },
  {
    name: 'amyrobson',
    timeAgo: '1 month ago',
    upvotes: 12,
    message:
      'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
    ref: true,
  },
  {
    name: 'amyrobson',
    timeAgo: '1 month ago',
    upvotes: 12,
    message:
      'Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You’ve nailed the design and the responsiveness at various breakpoints works really well.',
    ref: false,
  },
];

export const Comments = ({ chainId, contractAddress }) => {
  const [comment, setComment] = useState(''); // Initial state
  const [comments, setComments] = useState([]); // Initial state

  const [message, setMessage] = React.useState(
    `I am signing this message to authenticate my address with my account on Smart Reader.` // TODO could add nonce for extra security
  );
  const { signMessageAsync } = useSignMessage({
    message,
    // onSuccess(data) {
    //   console.log('Success', data);
    //   const verifyRequest = await postData(
    //   process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'login',
    //   { signed: msg, nonce: nonce, address: userAddress }
    // );
    //   console.log(data.message);
    // },
    // onError(error) {
    //   setIsLoggingIn(false);
    //   console.log('Error', error);
    // },
    // onMutate(args) {
    //   console.log('Mutate', args);
    // },
  });
  const { supabase, setToken } = useSupabase();
  const {
    address: userAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const checkLoggedIn = useCallback(() => {
    const token = Cookies.get('supabasetoken');
    if (!token) {
      // Prompt the user to log in or sign up.
    } else {
      // Use Supabase client to set the session:

      const decodedToken = jwtDecode(token);
      // Check if it's expired
      const currentTime = Date.now() / 1000; // in seconds
      if (decodedToken.exp < currentTime) {
        console.log('Token is expired');
      } else {
        console.log('Token is not expired');
        console.log(token);
        setToken(token);

        setIsLoggedIn(true);
      }
    }
  }, []);

  const getComments = useCallback(async () => {
    //   async function getComments() {
    if (!contractAddress || !chainId || contractAddress.length === 0) return;
    console.log('supabase token', supabase.realtime.accessToken);
    let { data: commentData, error } = await supabase
      .from('comments') // replace with your table name
      .select('*')
      .eq('contract_id', chainId + '-' + contractAddress);
    if (error) console.log('Error: ', error);

    // Map the data into the desired format
    const commentsNew = [];
    for (const comment of commentData) {
      const timeAgo = formatDistanceToNow(new Date(comment.timestamp), {
        addSuffix: true,
      });
      const upvotes = await getUpvotes(comment.comment_id);
      commentsNew.push({
        name: comment.user_address,
        upvotes: upvotes,
        message: comment.comment,
        ref: comment.ref,
        timeAgo: timeAgo,
      });
    }
    console.log('setting new comments', commentsNew);
    setComments(commentsNew);
  }, [contractAddress, chainId, supabase]);

  useEffect(() => {
    getComments();
    checkLoggedIn();
  }, [chainId, contractAddress, getComments, checkLoggedIn]);

  async function getUpvotes() {
    return 0;
  }
  async function login() {
    setIsLoggingIn(true);
    const nonce = await postData(
      process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'nonce',
      {
        address: userAddress,
      }
    );
    const msg = await signMessageAsync();

    // post sign message to api/verify with nonce and address
    const loginResponse = await postData(
      process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'login',
      {
        signed: msg,
        nonce: nonce.nonce,
        address: userAddress,
      }
    );
    const token = loginResponse.token;
    setCookie('supabasetoken', loginResponse.token);
    setIsLoggingIn(false);
    setIsLoggedIn(true);
    setToken(token);
  }

  async function logout() {
    setCookie('supabasetoken', '');
    setIsLoggedIn(false);
  }
  async function addComment() {
    const token = Cookies.get('supabasetoken');
    if (!comment || comment.length === 0) {
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const options = {
      headers,
    };
    const newSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
    newSupabase.headers['Authorization'] = `Bearer ${token}`; // for some reason this is what worked, needs cleaning
    const decodedToken = jwtDecode(token);

    // Check if it's expired
    const currentTime = Date.now() / 1000; // in seconds
    if (decodedToken.exp < currentTime) {
      console.log('Token is expired');
      setIsLoggedIn(false);
      return;
    }
    console.log('inserting comment');
    const commentToUpload = {
      contract_id: chainId + '-' + contractAddress,
      user_address: decodedToken.address,
      comment: comment,
    };
    const { data: insertedData, error: insertError } = await newSupabase
      .from('comments')
      .insert([commentToUpload]);
    if (insertError && !insertedData) {
      console.log('Insert Error: ', insertError);
      return;
    }

    // const comment = {
    //   id: uuidv4(),
    //   name: 'amyrobson',
    //   timeAgo: '1 month ago',
    //   upvotes: 12,
    //   message: 'Impressive! Though it seems the drag feature could be improved.',
    //   ref: false,
    // };
  }

  return (
    <>
      {isConnected && (
        <>
          <Button
            background="transparent"
            color="whiteAlpha.700"
            _hover={{ background: 'transparent', color: 'white' }}
            border="2px solid white"
            borderRadius="full"
            onClick={() => (isLoggedIn ? logout() : login())}
          >
            {isLoggingIn && <Spinner size="xs" mr={2} />}{' '}
            {isLoggedIn ? 'Log out' : isLoggingIn ? 'Logging in...' : 'Log in'}
          </Button>
          {!isLoggedIn && <h1>Please login to be able to add a comment</h1>}
        </>
      )}
      {isDisconnected && (
        <h1>Please connect your wallet to login and comment</h1>
      )}
      <Stack gap={4}>
        <Heading as="h1" size="md" fontWeight={600} noOfLines={1}>
          COMMENTS ({comments.length})
        </Heading>
        {isLoggedIn && (
          <Flex
            alignItems="center"
            background="#FFFFFF1A"
            borderRadius="lg"
            w="full"
            py={4}
            px={6}
            gap={4}
          >
            <Avatar name="Dan Abramov" />
            <Input
              value={comment} // Bind the value of the input field to the comment state
              onChange={(e) => setComment(e.target.value)}
              variant="filled"
              placeholder="Add a comment"
              background="#00000026"
              _hover={{ background: '#00000026' }}
              _placeholder={{ color: '#ADADAD' }}
              borderRadius="lg"
            />
            <Button
              borderRadius="full"
              background="white"
              color="#101D42"
              fontWeight={400}
              onClick={addComment}
            >
              Send
            </Button>
          </Flex>
        )}
        <List spacing={4}>
          {comments.map((comment) => (
            <Comment key={uuidv4()} comment={comment} />
          ))}
        </List>
      </Stack>
    </>
  );
};
