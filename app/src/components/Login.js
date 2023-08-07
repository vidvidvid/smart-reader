import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import postData from '../utils/api.js';
import { useSupabase } from '../utils/supabaseContext';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { Button, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useSignMessage } from 'wagmi';
import { setCookie } from 'typescript-cookie';
import jwtDecode from 'jwt-decode';

export const Login = () => {
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
  useEffect(() => {
    const token = Cookies.get('supabasetoken');
    if (!token) {
      // Prompt the user to log in or sign up.
    } else {
      // Use Supabase client to set the session:

      const decodedToken = jwtDecode(token);
      console.log('decodedToken', decodedToken);
      // Check if it's expired
      const currentTime = Date.now() / 1000; // in seconds
      console.log(Date.now());
      if (decodedToken.exp < currentTime) {
        console.log('Token is expired');
      } else {
        console.log('Token is not expired');
        setToken(token);

        setIsLoggedIn(true);
      }
    }
  }, []);
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
    // const { data } = await supabase
    //   .from('users')
    //   .select()
    //   .eq('address', userAddress)
    //   .single();
    // console.log(data);
    // if (data == null) {
    //   console.log('no data');
    // }
  }
  return (
    <>
      {isConnected && (
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
      )}
    </>
  );
};
