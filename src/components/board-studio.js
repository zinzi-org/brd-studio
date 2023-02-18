import React, { useState, useEffect, useRef } from "react";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

import ABI from '../web3/abi_dev.json';
//import ABI from '../web3/abi_prod.json';

//--bootstrap
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Badge from "react-bootstrap/Badge";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Jazzicon from 'react-jazzicon';
import Form from 'react-bootstrap/Form';
//--bootstrap


const Studio = (props) => {

    const [show, setShow] = useState(false);

    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardSymbol, setNewBoardSymbol] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [isConnected, setIsConnected] = useState(false);
    const [displayAddress, setDisplayAddress] = useState("");
    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [balance, setBalance] = useState(0);

    const [currentUsersBoards, setCurrentUsersBoards] = useState([]);

    const memberBoardFactory = useRef(null);
    const memberBoardNFT = useRef(null);

    const web3 = useRef(null);

    const boardFactoryInterface = {
        create: async (newBoardName, symbol) => {
            await memberBoardFactory.current.methods.create(newBoardName, symbol).send({ from: window.ethereum.selectedAddress })
        },
        isBoard: async (address) => {
            return await memberBoardFactory.current.methods.isBoard(address).call();
        },
        getMembersAddress: async () => {
            return await memberBoardFactory.current.methods.membersAddress().call();
        },
        getProjectsAddress: async () => {
            return await memberBoardFactory.current.methods.projectAddress().call();
        }
    };

    function boardInterface(address) {
        var contractInstance = new web3.current.eth.Contract(ABI.governorBoardABI, address);
        return {
            addGovernor: async (propId) => {
                await contractInstance.methods.addGovernor(propId).send({ from: window.ethereum.selectedAddress });
            },
            addMember: async (address) => {
                await contractInstance.methods.addMember(address).send({ from: window.ethereum.selectedAddress });

            },
            getTotalMembers: async () => {
                return await contractInstance.methods.getTotalMembers().call();
            },
            memberHasDelegation: async (address) => {
                return await contractInstance.methods.memberHasDelegation().call();
            },
            getGovWhoApprovedMember: async (address) => {
                return await contractInstance.methods.getGovWhoApprovedMember().call();
            },
            castVote: async (propId, vote) => {
                return await contractInstance.methods.castVote(propId, vote).send({ from: window.ethereum.selectedAddress });
            },
            propose: async (description, pType, address) => {
                return await contractInstance.methods.castVote(description, pType, address).send({ from: window.ethereum.selectedAddress });
            },
            isGovernor: async (address) => {
                return await contractInstance.methods.isGovernor(address).call();
            },
            setBoardURL: async (url) => {
                return await contractInstance.methods.setBoardURL(url).send({ from: window.ethereum.selectedAddress });
            },
            getMemberVotesAddress: async () => {
                return await contractInstance.methods.getMemberVotesAddress().call();
            },
            proposalVote: async (propId) => {
                return await contractInstance.methods.proposalVote(propId).send({ from: window.ethereum.selectedAddress });
            },
            hasVoted: async (propId, accountAddress) => {
                return await contractInstance.methods.hasVoted(propId, accountAddress).call();
            },
            hashProposal: async (pType, description, address) => {
                return await contractInstance.methods.hashProposal(pType, description, address).call();
            },
            state: async (propId) => {
                return await contractInstance.methods.state(propId).call();
            },
            proposalSnapshot: async (propId) => {
                return await contractInstance.methods.proposalSnapshot(propId).call();
            },
            proposalDeadline: async (propId) => {
                return await contractInstance.methods.proposalDeadline(propId).call();
            },
            votingDelay: async () => {
                return await contractInstance.methods.votingDelay().call();
            },
            votingPeriod: async () => {
                return await contractInstance.methods.votingDelay().call();
            },
            getVotes: async () => {
                return await contractInstance.methods.getVotes().call();
            },
            setProposalFee: async (newFee) => {
                await contractInstance.methods.setProposalFee(newFee).send({ from: window.ethereum.selectedAddress });
            },

        }
    }

    function memberVoteInterface(address) {
        var contractInstance = new web3.current.eth.Contract(ABI.memberVotesABI, address);
        return {
            name: async () => {
                return await memberBoardNFT.current.methods.name().call();
            },
            symbol: async () => {
                return await memberBoardNFT.current.methods.symbol().call();
            },
            mintTo: async (newMemberAddress, boardAddress) => {
                await memberBoardNFT.current.methods.mintTo(newMemberAddress, boardAddress).send({ from: window.ethereum.selectedAddress });
            },
            mintToFirst: async (newMemberAddress, boardAddress) => {
                await memberBoardNFT.current.methods.mintToFirst(newMemberAddress, boardAddress).send({ from: window.ethereum.selectedAddress });
            },
            tokenURI: async (tokenId) => {
                await memberBoardNFT.current.methods.tokenURI(tokenId).call();
            },
            getBoards: async (address) => {
                return await memberBoardNFT.current.methods.getBoards(address).call();
            },
            getBoardForToken: async (tokenId) => {
                return await memberBoardNFT.current.methods.getBoardForToken(tokenId).call();
            }
        };
    }

    

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

            memberBoardFactory.current = new web3.current.eth.Contract(ABI.governorBoardFactoryABI, ABI.governorBoardFactoryAddress);
            var memberNFTAddress = await boardFactoryInterface.getMembersAddress();
            memberBoardNFT.current = new web3.current.eth.Contract(ABI.membersABI, memberNFTAddress);

            if (provider.selectedAddress) {
                setDisplayAddress(getShortAccountAddress(provider.selectedAddress));
                setIsConnected(true);
                const balance = await web3.current.eth.getBalance(window.ethereum.selectedAddress);
                setBalance(parseFloat(web3.current.utils.fromWei(balance)).toFixed(3));
                setJazzIconInt(parseInt(window.ethereum.selectedAddress.slice(2, 10), 16));
            }
            window.ethereum.on('accountsChanged', onConnect);
            window.ethereum.on('connect', onConnect);

            await populateCurrentUserBoardList();

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

    async function populateCurrentUserBoardList() {
        var boards = await memberNFTInterface.getBoards(window.ethereum.selectedAddress);
        var result = [];
        var votesAddress = await boardInterface.getMemberVotesAddress();
        var memberVotes = memberVoteInterface(votesAddress);
        for (var i = 0; i < boards.length; i++) {
            var boardAddress = await memberNFTInterface.getBoardForToken(boards[i]);
            var
                result.push({ tokenId: boards[i], boardAddress });
        }

        setCurrentUsersBoards(result);

    }

    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };

    const createBoardMainClick = () => {
        handleShow(true);
    };

    const onBoardCreateClick = async () => {
        await boardFactoryInterface.create(newBoardName, newBoardSymbol);
        handleShow(false);
    };

    const getBoards = currentUsersBoards.map((model, index) => {
        return (
            <div key={index}>
                {model.boardAddress}
                {model.name}
            </div >
        )
    });


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
                        {getBoards}
                    </Col>
                </Row>
                <br />
                <br />

            </Container>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header>
                    Create Board
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={newBoardName} onChange={(e) => { setNewBoardName(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label>Symbol</Form.Label>
                            <Form.Control value={newBoardSymbol} onChange={(e) => { setNewBoardSymbol(e.target.value) }} type="text" />
                        </Form.Group>
                        <Button onClick={onBoardCreateClick}>
                            Create
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>

                </Modal.Footer>
            </Modal>
        </div >
    )
}


export default Studio;


