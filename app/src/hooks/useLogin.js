import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import postData from '../utils/api.js';
import { useSupabase } from '../utils/supabaseContext';
// import { Button, Spinner } from '@chakra-ui/react';
import jwtDecode from 'jwt-decode';
import { setCookie } from 'typescript-cookie';
import { useSignMessage } from 'wagmi';
import { useToast } from '@chakra-ui/react';

const useLogin = () => {
  const [message, setMessage] = useState(
    `I am signing this message to authenticate my address with my account on Smart Reader.` // TODO could add nonce for extra security
  );
  const { signMessageAsync } = useSignMessage({
    message,
  });
  const { supabase, setToken } = useSupabase();

  const { address: userAddress } = useAccount();

  const toast = useToast();

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
        setToken(token);
          toast({
            title: 'Logged in',
            description: 'You are now logged in.',
            status: 'success',
            duration: 9000,
            isClosable: true,
          });

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
    setCookie('supabasetoken', '');
      setIsLoggedIn(false);
  }

  return {
    login,
    logout,
    supabase,
    isLoggedIn,
    isLoggingIn,
    setIsLoggedIn,
    setIsLoggingIn,
    checkLoggedIn,
  };
};

export default useLogin;
