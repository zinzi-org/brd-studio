import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// Create a context for the Ethereum state
const EthereumContext = createContext();

// Create a provider component for this context
export function EthereumProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [displayAddress, setDisplayAddress] = useState("");
  const [jazzIconInt, setJazzIconInt] = useState(0);


  const onConnect = useCallback(async () => {
      const provider = await detectEthereumProvider();
      if (provider && window.ethereum) {
          if (provider.selectedAddress) {
              console.log(provider.selectedAddress);
              setDisplayAddress(getShortAccountAddress(provider.selectedAddress));
              setIsConnected(true);
              let web3 = new Web3(window.ethereum);
              const balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
              setBalance(parseFloat(web3.utils.fromWei(balance)).toFixed(3));
              setJazzIconInt(parseInt(window.ethereum.selectedAddress.slice(2, 10), 16));
          }
          window.ethereum.on('accountsChanged', onConnect);
          window.ethereum.on('connect', onConnect);
          
      } 
  }, []);

  useEffect(() => {
      onConnect();
      window.ethereum.on('accountsChanged', onConnect);
      window.ethereum.on('connect', onConnect);
      return () => {
          if (window.ethereum) {
              window.ethereum.removeListener('accountsChanged', onConnect);
              window.ethereum.removeListener('connect', onConnect);
          }

      };
  }, [onConnect]);

  function getShortAccountAddress(address) {
      if (address) {
          var firstFour = address.slice(0, 5);
          var lastFour = address.slice(-4);
          return firstFour + "..." + lastFour;
      }
  }


  // Pass the address and balance as the context value
  return <EthereumContext.Provider value={{ address, balance, isConnected, displayAddress, jazzIconInt }}>{children}</EthereumContext.Provider>;
}

// Create a custom hook that components can use to access the Ethereum state
export function useEthereum() {
  return useContext(EthereumContext);
}
