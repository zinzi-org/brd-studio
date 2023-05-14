import React, { useState, useEffect } from "react";
import { useEthereum } from '../ethContext';
import { Outlet, Link } from "react-router-dom";


//--bootstrap
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";
import Container from 'react-bootstrap/Container';
import Jazzicon from 'react-jazzicon';
//--bootstrap


const Layout = () => {


    const { selectedAddress, balance, isConnected } = useEthereum();

    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [displayAddress, setDisplayAddress] = useState("");

    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };

    useEffect(() => {
        if (selectedAddress) {
            setDisplayAddress(getShortAccountAddress(selectedAddress));
            setJazzIconInt(parseInt(selectedAddress.slice(2, 10), 16));
        }
    }, [selectedAddress]);

    function getShortAccountAddress(address) {
        if (address) {
            var firstFour = address.slice(0, 5);
            var lastFour = address.slice(-4);
            return firstFour + "..." + lastFour;
        }
    }

    return (
        <div>
            <Container>
                <Navbar variant="dark" expand="lg">
                    <Container>
                        <Nav defaultActiveKey="#explorer">
                            <Link to={"/"}><Navbar.Brand>Boards</Navbar.Brand></Link>
                            <Link to={"/projects"}><Navbar.Brand>Projects</Navbar.Brand></Link>
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


export default Layout;