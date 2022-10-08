import React, { useState, useEffect, useRef } from "react";
import axios from 'axios'
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

//import ABI from '../web3/abi_dev.json';
import ABI from '../web3/abi_prod.json';

//--bootstrap
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Jazzicon from 'react-jazzicon';
//--bootstrap


const Studio = (props) => {

    const [isConnected, setIsConnected] = useState(false);
    const [displayAddress, setDisplayAddress] = useState("");
    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [balance, setBalance] = useState(0);

    const memberBoardFactory = useRef(null);
    const memberBoardNFT = useRef(null);

    const web3 = useRef(null);

    const boardFactoryInterface = {
        create: async (newBoardName) => {
            memberBoardFactory.current.methods.create(newBoardName).send({ from: window.ethereum.selectedAddress })
        },
        isBoard: async (address) => {
            return memberBoardFactory.current.methods.isBoard(address).call();
        }
    };

    const memberNFTInterface = {
        mintTo: async (newMemberAddress, boardAddress) => {
            memberBoardNFT.current.methods.mintTo(newMemberAddress, boardAddress).send({ from: window.ethereum.selectedAddress });
        },
        mintToFirst: async (newMemberAddress, boardAddress) => {
            memberBoardNFT.current.methods.mintToFirst(newMemberAddress, boardAddress).send({ from: window.ethereum.selectedAddress });
        },
        tokenURI: async (tokenId) => {
            memberBoardNFT.current.methods.tokenURI(tokenId).call();
        },
        getTokenIdGroupAddress: async (tokenId) => {
            memberBoardNFT.current.methods.getTokenIdGroupAddress(tokenId).call();
        }
    };

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
            web3.current = new Web3(window.ethereum);

            memberBoardFactory.current = new web3.current.eth.Contract(ABI.boardFactoryABI, ABI.boardFactoryAddress);
            var memberNFTAdress = await memberBoardFactory.current.methods.memberNFTAddress().call();
            memberBoardNFT.current = new web3.current.eth.Contract(ABI.memberNFTABI, memberNFTAdress);

            if (provider.selectedAddress) {
                setDisplayAddress(getShortAccountAddress(provider.selectedAddress));
                setIsConnected(true);
                const balance = await web3.current.eth.getBalance(window.ethereum.selectedAddress);
                setBalance(parseFloat(web3.current.utils.fromWei(balance)).toFixed(3));
                setJazzIconInt(parseInt(window.ethereum.selectedAddress.slice(2, 10), 16));
            }
            window.ethereum.on('accountsChanged', onConnect);
            window.ethereum.on('connect', onConnect);
        } else {
            web3.current = new Web3();
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

    const createBoardMainClick = () => {

    };

    return (
        <div>
            <Container>
                <Navbar variant="dark" expand="lg">
                    <Container>
                        <Nav>
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
                <Row className="header-wrapper" >
                    <Col className="header-text">
                        <div style={{ textAlign: "center" }}>
                            Member Boards
                        </div>
                    </Col>
                    <Col md="1">
                        <Button variant="danger" onClick={createBoardMainClick}>Create</Button>
                    </Col>
                </Row>
                <br />
                <br />
                <Row>
                    <Col>

                    </Col>
                </Row>
                <br />
                <br />

            </Container>
            <Modal>
                <Modal.Header>
                    Create Board
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
                <Modal.Footer>

                </Modal.Footer>
            </Modal>
        </div >
    )
}


export default Studio;


