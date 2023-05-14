import React, { useState, useEffect, useCallback } from "react";
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


    const { address, balance, isConnected, displayAddress, jazzIconInt } = useEthereum();

    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };

    return (
        <div>
            <Container>
                <Navbar variant="dark" expand="lg">
                    <Container>
                        <Nav defaultActiveKey="#explorer">
                            <Link to={"/"}><Navbar.Brand>Board Studio</Navbar.Brand></Link>
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