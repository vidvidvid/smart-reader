
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
const isContract = async (address, provider) => {
  if (!address) return false
  const code = await provider.getCode(address)
  return code && code !== '0x'
}


export {
  shortenAddress,
  isContract
}