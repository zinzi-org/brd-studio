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
import Spinner from 'react-bootstrap/Spinner';
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

    const [isLoading, setIsLoading] = useState(false);

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
          
            result.push({
                boardAddress,
                boardName,
                boardSymbol,
                boardToken,
                totalMembers,
                isGovernor,
                votingPower,
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
            if (window.ethereum.selectedAddress && usersBoards.length > 0) {
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
        setIsLoading(true);
        await boardFactoryInterface.current.create(newBoardName, newBoardSymbol);
        await populateCurrentUserBoardList();
        await onConnect();
        handleCreateClose();
        setIsLoading(false);
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
                    <b><Link to={"board/" + model.boardAddress}>{model.boardName}</Link></b>
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
                    <b><Link to={"board/" + model.boardAddress}>{model.name}</Link></b>
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
                    My Boards
                </Col>
            </Row>
            <Row>
                <Col>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>
                                    Name
                                </th>
                                <th>
                                    Total Members
                                </th>
                                <th>
                                    Address
                                </th>
                                <th>
                                    Member Type
                                </th>
                                <th>
                                    Voting Power
                                </th>
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
                    Board Explorer
                </Col>
                <Col md="2">
                    <Button variant="danger" onClick={createBoardMainClick}>Create Board</Button>
                </Col>
            </Row>

            <br />

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>
                            <b>Name</b>
                        </th>
                        <th>
                            <b>Member Count</b>
                        </th>
                        <th>
                            <b>Address</b>
                        </th>
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

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateClose}>
                        Cancel
                    </Button>
                    <Button hidden={isLoading} onClick={onBoardCreateClick}>
                        Create
                    </Button>
                    <Spinner hidden={!isLoading} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Modal.Footer>
            </Modal>



        </div>
    )
}


export default Browser;