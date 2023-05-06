import React, { useState, useEffect, useRef } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import { Link } from "react-router-dom";
//--bootstrap
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
//--bootstrap

import BoardFactoryInterface from "../web3/interfaces/boardFactory";
import BoardInterface from "../web3/interfaces/board";
import MembersInterface from "../web3/interfaces/members";
import MemberVotesInterface from "../web3/interfaces/memberVotes";

const Browser = (props) => {

    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

    const handleCreateClose = () => setShowCreateBoardModal(false);
    const handleCreateShow = () => setShowCreateBoardModal(true);

    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardSymbol, setNewBoardSymbol] = useState("");

    const [currentUsersBoards, setCurrentUsersBoards] = useState([]);
    const [allBoards, setAllBoards] = useState([]);

    const boardFactoryInterface = useRef(null);
    const membersInterface = useRef(null);

    useEffect(() => {
        onConnect();
    }, []);

    async function onConnect() {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum) {
            var usersBoards = [];
            boardFactoryInterface.current = new BoardFactoryInterface();
            let membersAddress = await boardFactoryInterface.current.getMembersAddress();
            membersInterface.current = new MembersInterface(membersAddress);
            if (provider.selectedAddress) {
                usersBoards = await populateCurrentUserBoardList();
            }
            await popualateAllBoards(usersBoards);
        }
    }

    async function populateCurrentUserBoardList() {
        var boards = await membersInterface.current.getBoards(window.ethereum.selectedAddress);
        var result = [];
        for (var i = 0; i < boards.length; i++) {
            var boardToken = boards[i];
            var boardAddress = await membersInterface.current.getBoardForToken(boardToken);
            var board = new BoardInterface(boardAddress);
            var boardName = await board.name();
            var boardSymbol = await board.symbol();
            var totalMembers = await board.getTotalMembers();
            var isGovernor = await board.isGovernor(window.ethereum.selectedAddress);
            var memberVotesAddress = await board.getMemberVotesAddress();
            let memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
            var votingPower = await memberVotesInterface.getVotes(window.ethereum.selectedAddress);
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
        var boards = await boardFactoryInterface.current.getAllBoards();
        var result = [];
        for (var i = 0; i < boards.length; i++) {
            var address = boards[i].returnValues[0];
            var board = new BoardInterface(address);
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


    //open/close modal
    const createBoardMainClick = () => {
        handleCreateShow();
    };

    //on board create 
    const onBoardCreateClick = async () => {
        await boardFactoryInterface.current.create(newBoardName, newBoardSymbol);
        await populateCurrentUserBoardList();
        await popualateAllBoards();
        handleCreateClose();
    };

    function getShortAccountAddress(address) {
        if (address) {
            var firstFour = address.slice(0, 5);
            var lastFour = address.slice(-4);
            return firstFour + "..." + lastFour;
        }
    }

    const onJoinBoardClick = async (boardAddress) => {

    };

    const getCurrentUserBoards = currentUsersBoards.map((model, index) => {
        return (
            <tr key={index}>
                <td>
                    <Link to={"board/" + model.boardAddress}>{model.boardName}</Link>
                </td>
                <td>
                    {model.totalMembers}
                </td>
                <td>
                    <small>{getShortAccountAddress(model.boardAddress)}</small>
                </td>
                <td>
                    {model.isGovernor ? "Governor" : "Member"}
                </td>
                <td>
                    {model.votingPower}
                </td>
            </tr>
        )
    });

    const getAllBoards = allBoards.map((model, index) => {
        return (

            <tr key={ImageBitmapRenderingContext}>
                <td>
                    <Link to={"board/" + model.boardAddress}>{model.name}</Link>
                </td>
                <td>
                    {model.totalMembers}
                </td>
                <td>
                    <small>{getShortAccountAddress(model.boardAddress)}</small>
                </td>
            </tr>


        )
    });


    return (
        <div>
            <Row className="header-wrapper" >
                <Col className="header-text">
                    <div style={{ textAlign: "center" }}>
                        My Boards
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>

                    <Table>
                        <thead>
                            <tr>
                                <td>
                                    Name
                                </td>
                                <td>
                                    Total Members
                                </td>
                                <td>
                                    Address
                                </td>
                                <td>
                                    Member Type
                                </td>
                                <td>
                                    Voting Power
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentUserBoards}
                        </tbody>
                    </Table>



                </Col>
            </Row>

            <br />

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

            <Table>
                <thead>
                    <tr>
                        <td>
                            <b>Name</b>
                        </td>
                        <td>
                            <b>Member Count</b>
                        </td>
                        <td>
                            <b>Address</b>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {getAllBoards}
                </tbody>
            </Table>

            <br />

            <Modal show={showCreateBoardModal} onHide={handleCreateClose}>
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



        </div>
    )
}


export default Browser;