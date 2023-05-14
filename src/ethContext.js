import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// Create a context for the Ethereum state
const EthereumContext = createContext();

// Create a provider component for this context
export function EthereumProvider({ children }) {
    
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isProvider, setIsProvider] = useState(false);
    const [provider, setProvider] = useState(null);

    const onConnect = useCallback(async () => {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum) {
            setIsProvider(true);
            setProvider(provider);
            if (provider.selectedAddress) {
                setSelectedAddress(provider.selectedAddress);
                setIsConnected(true);
                let web3 = new Web3(window.ethereum);
                const balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
                setBalance(parseFloat(web3.utils.fromWei(balance)).toFixed(3));
            }
        }
    }, []);

    useEffect(() => {
        onConnect();
        if(window.ethereum){
            window.ethereum.on('accountsChanged', onConnect);
            window.ethereum.on('connect', onConnect);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', onConnect);
                window.ethereum.removeListener('connect', onConnect);
            }

        };
    }, [onConnect]);




    // Pass the address and balance as the context value
    return <EthereumContext.Provider value={{ selectedAddress, balance, isConnected, isProvider, provider }}>{children}</EthereumContext.Provider>;
}

// Create a custom hook that components can use to access the Ethereum state
export function useEthereum() {
    return useContext(EthereumContext);
}
