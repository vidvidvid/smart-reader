import { ethers } from 'ethers'

const shortenAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Takes an address and provider and returns true if the address is a contract
 * @param {*} address
 * @param {*} provider
 * @returns {boolean} true if the address is a contract
 */
const isContract = async (address) => {
  if (!address) return false
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const code = await provider.getCode(address)
  return code && code !== '0x'
}

const validateInput = (input, validationResult, setValidationResult) => {
  let message = '';
  console.log('validateInput', { input, validationResult, setValidationResult });
  if (!input) setValidationResult({ result: true, message: '' });

  if (input.length === 42 && input.startsWith('0x')) {

    isContract(input).then((result) => {
      if (result) {
        message = 'Address is a contract';

        setValidationResult({
          result: true,
          message,
        });
        return {
          result: true,
          message,
        }
      } else {
        message = 'Address is not a contract';

        setValidationResult({
          result: false,
          message,
        });
        return {
          result: false,
          message,
        }
      }
    })
    message = 'Address is valid';

  } else if (input.length < 42 && input.startsWith('0x')) {
    message = 'Address is too short';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    }
  } else if (input.length === 42 && !input.startsWith('0x')) {
    message = 'Address is missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    }
  } else if (input.length < 42 && !input.startsWith('0x')) {
    message = 'Address is too short and missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    }
  } else if (input.length > 42 && input.startsWith('0x')) {

    message = 'Address is too long';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    }
  } else if (input.length > 42 && !input.startsWith('0x')) {
    message = 'Address is too long and missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    }
  } else {
    setValidationResult({ result: false, message: '' });
  }

}

export {
  shortenAddress,
  isContract,
  validateInput,
}