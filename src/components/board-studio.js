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
    const [showExplorer, setShowExplorer] = useState(true);

    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardSymbol, setNewBoardSymbol] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [isConnected, setIsConnected] = useState(false);
    const [displayAddress, setDisplayAddress] = useState("");
    const [jazzIconInt, setJazzIconInt] = useState(0);
    const [balance, setBalance] = useState(0);

    const [currentUsersBoards, setCurrentUsersBoards] = useState([]);
    const [allBoards, setAllBoards] = useState([]);


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
        },
        getAllBoards: async () => {
            return await memberBoardFactory.current.getPastEvents('BoardCreated', {
                fromBlock: 0,
                toBlock: 'latest'
            });
        },
    };

    function boardInterface(address) {
        var contractInstance = new web3.current.eth.Contract(ABI.governorBoardABI, address);
        return {
            name: async () => {
                return await contractInstance.methods.name().call();
            },
            symbol: async () => {
                return await contractInstance.methods.symbol().call();
            },
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
            castVote: async (propId, vote) => {
                return await contractInstance.methods.castVote(propId, vote).send({ from: window.ethereum.selectedAddress });
            },
            propose: async (description, pType, address) => {
                return await contractInstance.methods.castVote(description, pType, address).send({ from: window.ethereum.selectedAddress });
            },
            isGovernor: async (address) => {
                return await contractInstance.methods.isGovernor(address).call();
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
            getProposals: async () => {
                try {
                    return await memberBoardFactory.current.getPastEvents('Proposal', {
                        fromBlock: 0,
                        toBlock: 'latest'
                    });
                } catch (e) {
                    console.log(e);
                    return [];
                }

            },
            getMemberApprovals: async () => {
                return await memberBoardFactory.current.getPastEvents('ApproveMember', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });
            },
            getGovernorApprovals: async () => {
                return await memberBoardFactory.current.getPastEvents('AddGovernor', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });
            }
        }
    }

    const memberNFTInterface = {
        name: async () => {
            return await memberBoardNFT.current.methods.name().call();
        },
        symbol: async () => {
            return await memberBoardNFT.current.methods.symbol().call();
        },
        mintTo: async (newMemberAddress, boardAddress) => {
            await memberBoardNFT.current.methods.mintTo(newMemberAddress, boardAddress)
                .send({ from: window.ethereum.selectedAddress });
        },
        mintToFirst: async (newMemberAddress, boardAddress) => {
            await memberBoardNFT.current.methods.mintToFirst(newMemberAddress, boardAddress)
                .send({ from: window.ethereum.selectedAddress });
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

    function memberVoteContractInstance(address) {
        const memberVoteContract = new web3.current.eth.Contract(ABI.memberVotesABI, address);

        return {
            name: async function () {
                return await memberVoteContract.methods.name().call();
            },
            symbol: async function () {
                return await memberVoteContract.methods.symbol().call();
            },
            decimals: async function () {
                return await memberVoteContract.methods.decimals().call();
            },
            totalSupply: async function () {
                return await memberVoteContract.methods.totalSupply().call();
            },
            balanceOf: async function (account) {
                return await memberVoteContract.methods.balanceOf(account).call();
            },
            checkpoints: async function (account, pos) {
                return await memberVoteContract.methods.checkpoints(account, pos).call();
            },
            numCheckpoints: async function (account) {
                return await memberVoteContract.methods.numCheckpoints(account).call();
            },
            delegateSafeCheck: async function (account) {
                return await memberVoteContract.methods.delegateSafeCheck(account).call();
            },
            getVotes: async function (account) {
                return await memberVoteContract.methods.getVotes(account).call();
            },
            getPastVotes: async function (account, blockNumber) {
                return await memberVoteContract.methods
                    .getPastVotes(account, blockNumber)
                    .call();
            },
            getPastTotalSupply: async function (blockNumber) {
                return await memberVoteContract.methods
                    .getPastTotalSupply(blockNumber)
                    .call();
            },
            delegate: async function (delegatee, from, privateKey) {
                const data = memberVoteContract.methods.delegate(delegatee).encodeABI();
                const gas = await memberVoteContract.methods.delegate(delegatee).estimateGas({ from });
                const nonce = await web3.eth.getTransactionCount(from);
                const tx = {
                    from: from,
                    to: address,
                    gas: gas,
                    nonce: nonce,
                    data: data,
                };
                const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
                return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            },
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
            var usersBoards = [];
            if (provider.selectedAddress) {
                setDisplayAddress(getShortAccountAddress(provider.selectedAddress));
                setIsConnected(true);
                const balance = await web3.current.eth.getBalance(window.ethereum.selectedAddress);
                setBalance(parseFloat(web3.current.utils.fromWei(balance)).toFixed(3));
                setJazzIconInt(parseInt(window.ethereum.selectedAddress.slice(2, 10), 16));
                usersBoards = await populateCurrentUserBoardList();
            }

            window.ethereum.on('accountsChanged', onConnect);
            window.ethereum.on('connect', onConnect);


            await popualateAllBoards(usersBoards);

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
        for (var i = 0; i < boards.length; i++) {
            var boardToken = boards[i];
            var boardAddress = await memberNFTInterface.getBoardForToken(boardToken);
            var board = new boardInterface(boardAddress);
            var boardName = await board.name();
            var boardSymbol = await board.symbol();
            var totalMembers = await board.getTotalMembers();
            var isGovernor = await board.isGovernor(window.ethereum.selectedAddress);
            var memberVotesAddress = await board.getMemberVotesAddress();
            var memberVotesInstance = new memberVoteContractInstance(memberVotesAddress);
            var votingPower = await memberVotesInstance.getVotes(window.ethereum.selectedAddress);
            var proposals = await board.getProposals();

            var propsItems = [];

            for (var x = 0; x < proposals.length; x++) {
                var proposal = proposals[x];
                var proposalId = proposal[0];
                var description = proposal[1];
                var pType = proposal[2];
                var proposalVotes = await board.getProposalVotes(proposalId);
                var propState = await board.getProposalState(proposalId);

                propsItems.push({
                    proposalId,
                    description,
                    pType,
                    proposalVotes,
                    propState
                });

            }


            result.push({
                boardAddress,
                boardName,
                boardSymbol,
                boardToken,
                totalMembers,
                isGovernor,
                votingPower,
                propsItems
            });
        }
        setCurrentUsersBoards(result);
        return result;
    }

    async function popualateAllBoards(usersBoards) {
        var boards = await boardFactoryInterface.getAllBoards();
        var result = [];
        for (var i = 0; i < boards.length; i++) {
            var address = boards[i].returnValues[0];
            var board = new boardInterface(address);
            var boardName = await board.name();
            var boardSymbol = await board.symbol();
            var totalMembers = await board.getTotalMembers();
            var isMember = false;
            var isGovernor = false;
            if (window.ethereum.selectedAddress) {
                isMember = usersBoards.filter(x => x.boardAddress === address).length > 0;
                isGovernor = await board.isGovernor(window.ethereum.selectedAddress);
            }
            result.push({ boardAddress: address, name: boardName, symbol: boardSymbol, totalMembers, isMember, isGovernor });
        }

        setAllBoards(result);
    }

    const connectClick = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    };

    const showExplorerClick = () => {
        setShowExplorer(true);
    };

    const showMyBoardsClick = () => {
        setShowExplorer(false);
    };

    const onJoinBoardClick = async () => {

    };


    //Create Boards ---

    //open/close modal
    const createBoardMainClick = () => {
        handleShow();
    };

    //on board create 
    const onBoardCreateClick = async () => {
        await boardFactoryInterface.create(newBoardName, newBoardSymbol);
        await populateCurrentUserBoardList();
        await popualateAllBoards();
        handleClose();
    };

    const getCurrentUserBoards = currentUsersBoards.map((model, index) => {
        const proposalMapping = model.propsItems.map((prop, index) => {
            return (
                <Row key={index} className="board-row-item">
                    <Col xs={3} className="item-center">
                        {prop.proposalId}
                    </Col>
                    <Col xs={2} className="item-center">
                        {prop.description}
                    </Col>
                    <Col xs={2} className="item-center">
                        {prop.pType}
                    </Col>
                    <Col xs={2} className="item-center">
                        {prop.proposalVotes}
                    </Col>
                    <Col xs={2} className="item-center">
                        {prop.propState}
                    </Col>
                </Row>
            );
        });
        return (
            <div key={index} className="boarder-member">
                <Row>
                    <Col xs={3} className="item-center">
                        Name
                    </Col>
                    <Col xs={2} className="item-center">
                        Total Members
                    </Col>
                    <Col xs={5} className="item-center">
                        Address
                    </Col>
                </Row>
                <hr />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        {model.boardName}
                    </Col>
                    <Col xs={2} className="item-center">
                        {model.totalMembers}
                    </Col>
                    <Col xs={5} className="item-center">
                        {model.boardAddress}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={3} className="item-center">
                        Member Type
                    </Col>
                    <Col xs={3} className="item-center">
                        Voting Power
                    </Col>
                </Row>
                <hr />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        {model.isGovernor ? "Governor" : "Member"}
                    </Col>
                    <Col xs={3} className="item-center">
                        {model.votingPower}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col className="item-center">
                        <h3>Proposals</h3>
                    </Col>
                </Row>
                {proposalMapping}
            </div >
        )
    });

    const getAllBoards = allBoards.map((model, index) => {
        return (
            <div key={index}>
                <Row className="board-row-item">
                    <Col xs={3}>
                        {model.name}
                    </Col>
                    <Col xs={2} className="item-center">
                        {model.totalMembers}
                    </Col>
                    <Col xs={5}>
                        {model.boardAddress}
                    </Col>
                    <Col>
                        <div hidden={model.isMember}>
                            <Button variant="warning" onClick={() => onJoinBoardClick(model.boardAddress)}>Apply</Button>
                        </div>
                        <div hidden={!model.isMember}>
                            <span>Member</span>
                        </div>
                    </Col>
                </Row>
            </div >
        )
    });


    return (
        <div>
            <Container>
                <Navbar variant="dark" expand="lg">
                    <Container>
                        <Nav defaultActiveKey="#explorer">
                            <Navbar.Brand>Board Studio</Navbar.Brand>
                            <Nav.Link href="#explorer" onClick={showExplorerClick}>
                                Explorer
                            </Nav.Link>
                            <Nav.Link href="#myboard" onClick={showMyBoardsClick}>
                                My Boards
                            </Nav.Link>
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
                <div hidden={!showExplorer}>
                    <Row className="header-wrapper" >
                        <Col className="header-text">
                            <div style={{ textAlign: "center" }}>
                                Board Explorer
                            </div>
                        </Col>
                        <Col md="1">
                            <Button variant="danger" onClick={createBoardMainClick}>Create</Button>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col xs={3}>
                            <b>Name</b>
                        </Col>
                        <Col xs={2} className="item-center">
                            <b>Member Count</b>
                        </Col>
                        <Col xs={4}>
                            <b>Address</b>
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        <Col>
                            {getAllBoards}
                        </Col>
                    </Row>
                </div>
                <div hidden={showExplorer}>
                    <Row className="header-wrapper" >
                        <Col className="header-text">
                            <div style={{ textAlign: "center" }}>
                                My Boards
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col>
                            {getCurrentUserBoards}
                        </Col>
                    </Row>
                </div>
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