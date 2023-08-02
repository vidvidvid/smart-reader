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
      } else {
        // User is not logged in or there was an error.
        // You should handle this appropriately in your application.
      }
    }
  }, []);
  async function login() {}

  async function logout() {}
  return (
    <Button
      background="transparent"
      color="whiteAlpha.700"
      _hover={{ background: 'transparent', color: 'white' }}
      border="2px solid white"
      borderRadius="full"
      onClick={() => (isLoggedIn ? logout() : login())}
    >
      {isConnecting && <Spinner size="xs" mr={2} />}{' '}
      {isLoggedIn ? 'Log out' : isLoggingIn ? 'Logging in...' : 'Log in'}
    </Button>
  );
};
