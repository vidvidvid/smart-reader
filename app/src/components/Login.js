import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { SupabaseClient, User } from '@supabase/supabase-js';
import postData from '../utils/api.js';
import { useSupabase } from '../utils/supabaseContext';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { Button, Spinner } from '@chakra-ui/react';

export const Login = () => {
  const supabase = useSupabase();
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
      supabase.auth.setAuth(token);

      // Then retrieve the user details:
      const user = supabase.auth.user();
      if (user) {
        setIsLoggedIn(true);
      }
    }
  }, []);
  async function login() {
    setIsLoggingIn(true);
    console.log(process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL);
    const nonce = await postData(
      process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'nonce',
      {
        address: userAddress,
      }
    );
    console.log('nonce', nonce);
    //     const msg = await state.activeProvider
    //     .send("personal_sign", [
    //       ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)),
    //     ]);

    //   // post sign message to api/verify with nonce and address
    //   const verifyRequest = await postData(
    //     `${state.config.API_URL}/api/login`,
    //     { signed: msg,
    //       nonce: nonceRequest.nonce,
    //       address: state.address
    //     }
  }

  async function logout() {}
  return (
    <>
      {!isConnected && (
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
