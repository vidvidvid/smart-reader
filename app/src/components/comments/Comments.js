import { Heading, List, Stack, Flex, Avatar, Input, Button } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from 'wagmi';
import { Comment } from './Comment';
// import { Button, Spinner } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import jwtDecode from 'jwt-decode';
import useLogin from '../../hooks/useLogin';
import { AddComment } from './AddComment.js';
import { lowercaseAddress } from '../utils/helpers';
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
  const {
    address: userAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();

  const { isLoggedIn, supabase, setIsLoggedIn, checkLoggedIn } = useLogin();

  // function to make username from wallet address after removing the 0x
  function makeUsername(address) {
    let username = address.slice(2);
    username = lowercaseAddress(username);
    return username;
  }

  const username = makeUsername(userAddress);

  const getComments = useCallback(async () => {
    //   async function getComments() {
    if (!contractAddress || !chainId || contractAddress.length === 0) return;
    let { data: commentData, error } = await supabase
      .from('comments') // replace with your table name
      .select('*')
      .eq('contract_id', chainId + '-' + contractAddress);
    if (error) console.log('Error: ', error);
    console.log(commentData)
    if (!commentData) return;
    // Map the data into the desired format
    const commentsNew = [];
    for (const comment of commentData) {
      const timeAgo = formatDistanceToNow(new Date(comment.timestamp), {
        addSuffix: true,
      });
      // const upvotes = await getUpvotes(comment.comment_id);
      commentsNew.push({
        id: comment.comment_id,
        name: username,
        // upvotes: upvotes,
        message: comment.comment,
        ref: comment.ref,
        timeAgo: timeAgo,
        isLoggedIn: isLoggedIn,
      });
    }
    setComments(commentsNew);
  }, [contractAddress, chainId, supabase]);

  useEffect(() => {
    getComments();
    checkLoggedIn();
  }, [chainId, contractAddress, getComments, checkLoggedIn]);

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
    const newSupabase = await createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      options
    );
    newSupabase.headers['Authorization'] = `Bearer ${token}`; // for some reason this is what worked, needs cleaning
    const decodedToken = jwtDecode(token);

    // Check if it's expired
    const currentTime = Date.now() / 1000; // in seconds
    if (decodedToken.exp < currentTime) {
      console.log('Token is expired');
      setIsLoggedIn(false);
      return;
    }
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
      // tried this, it doesn't fix
      // console.log('trying again');
      // const { data: insertedData2ndAttempt, error: insertError2ndAttempt } =
      //   await newSupabase.from('comments').insert([commentToUpload]);
      // if (insertError2ndAttempt && !insertedData2ndAttempt) {
      //   console.log('Insert Error: ', insertError2ndAttempt);
      // }
      return;
    }
    getComments();

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
          {/* <Button
            background="transparent"
            color="whiteAlpha.700"
            _hover={{ background: 'transparent', color: 'white' }}
            border="2px solid white"
            borderRadius="full"
            onClick={() => (isLoggedIn ? logout() : login())}
          >
            {isLoggingIn && <Spinner size="xs" mr={2} />}{' '}
            {isLoggedIn ? 'Log out' : isLoggingIn ? 'Logging in...' : 'Log in'}
          </Button> */}
          {!isLoggedIn && <h2>Please login to be able to add a comment</h2>}
        </>
      )}
      {isDisconnected && (
        <h2>Please connect your wallet to login and comment</h2>
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
            <Avatar name={username} />
            <Input
              value={comment} // Bind the value of the input field to the comment state
              onChange={(e) => setComment(e.target.value)}
              variant="filled"
              placeholder="Add a comment"
              background="#00000026"
              _hover={{ background: '#00000026' }}
              _placeholder={{ color: '#ADADAD' }}
                          borderRadius="lg"
                          isDisabled={!isLoggedIn}
            />
            <Button
              borderRadius="full"
              background="white"
              color="#101D42"
              fontWeight={400}
                          onClick={addComment}
                            isDisabled={!isLoggedIn}
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
