import React, { useState, useEffect, useRef } from "react";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { Routes, Route, Outlet, Link } from "react-router-dom";

//--bootstrap
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";
import Container from 'react-bootstrap/Container';
import Jazzicon from 'react-jazzicon';
//--bootstrap


const Studio = (props) => {

    const [isConnected, setIsConnected] = useState(false);
    const [displayAddress, setDisplayAddress] = useState("");
    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        onConnect();
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', onConnect);
                window.ethereum.removeListener('connect', onConnect);
            }

        };
    }, []);

    async function onConnect() {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum) {
            if (provider.selectedAddress) {
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
    }

    function getShortAccountAddress(address) {
        if (address) {
            var firstFour = address.slice(0, 5);
            var lastFour = address.slice(-4);
            return firstFour + "..." + lastFour;
        }
    }



    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };



    return (
        <div>
            <Container>
                <Navbar variant="dark" expand="lg">
                    <Container>
                        <Nav defaultActiveKey="#explorer">
                            <Navbar.Brand>Board Studio</Navbar.Brand>
                        </Nav>
                        <Nav>
                            <Nav.Link>
                                {!isConnected &&
                                    <div>
                                        <Button variant="warning" onClick={connectClick}>Connect to MetaMask</Button>
                                    </div>
                                }
                                {isConnected && <Badge bg="secondary">
                                    <div className="navbar-badge">
                                        <Jazzicon diameter={24} seed={jazzIconInt} />
                                        &nbsp; &nbsp;&nbsp;<span>{displayAddress}</span>&nbsp;&nbsp;&nbsp;
                                        <Badge>{balance} eth</Badge>
                                    </div>
                                </Badge>}
                            </Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
                <br />
                <br />
                <Outlet />
            </Container>
        </div >
    )
}


export default Studio;