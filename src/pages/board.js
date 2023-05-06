import React, { useState, useEffect, useRef  } from "react";
import { useParams } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';



//--bootstrap
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
//--bootstrap

import BoardFactoryInterface from "../web3/interfaces/boardFactory";
import BoardInterface from "../web3/interfaces/board";
import MembersInterface from "../web3/interfaces/members";
import MemberVotesInterface from "../web3/interfaces/memberVotes";

const Board = (props) => {
    const { address } = useParams();



    const handleProposalClose = () => setShowCreateProposalModal(false);
    const handleProposalShow = () => setShowCreateProposalModal(true);

    const [newProposalDescription, setNewProposalDescription] = useState("");
    const [newProposalType, setNewProposalType] = useState("");
    const [newProposalAddress, setNewProposalAddress] = useState("");
    const [showNewProposalAddress, setShowNewProposalAddress] = useState(false);
    const [showNewProposalDuration, setShowNewProposalDuration] = useState(false);
    const [newProposalDuration, setNewProposalDuration] = useState(0);
    const [showNewDelegationPercentage, setShowNewDelegationPercentage] = useState(false);
    const [newDelegationPercentage, setNewDelegationPercentage] = useState(0);
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);

    const handleApplicantClose = () => setShowNewApplicantModal(false);
    const handleApplicantShow = () => setShowNewApplicantModal(true);

    const [showNewApplicantModal, setShowNewApplicantModal] = useState(false);
    const [newApplicantDescription, setNewApplicantDescription] = useState("");


    const boardFactoryInterface = useRef(null);
    const membersInterface = useRef(null);

    const [boardDetail, setBoardDetail] = useState({propsItems:[]});

    useEffect(() => {
        onConnect();
    }, []);

    async function onConnect() {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum) {


            boardFactoryInterface.current = new BoardFactoryInterface();
            let membersAddress = await boardFactoryInterface.current.getMembersAddress();
            membersInterface.current = new MembersInterface(membersAddress);

            if (provider.selectedAddress) {

            }

           var board = await getBoardDetail(address);

           setBoardDetail(board);
        }
    }

    const getBoardDetail = async (boardAddress) => {
        let boardInterface = new BoardInterface(boardAddress);
        let boardName = await boardInterface.name();
        let totalMembers = await boardInterface.getTotalMembers();
        let isGovernor = await boardInterface.isGovernor(window.ethereum.selectedAddress);
        var memberVotesAddress = await boardInterface.getMemberVotesAddress();
        let memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
        var votingPower = await memberVotesInterface.getVotes(window.ethereum.selectedAddress);
        let propsItems = await boardInterface.getProposals(boardAddress);
        return {
            boardName: boardName,
            totalMembers: totalMembers,
            isGovernor: isGovernor,
            votingPower: votingPower,
            boardAddress: boardAddress,
            propsItems: propsItems
        };
    }



    const onProposalCreateClick = async () => {
        handleProposalShow();
        setNewProposalDescription("");
        setNewProposalType(0);
    };

    // <option value={0}>Text Based</option>
    // <option value={1}>Add Governor</option>
    // <option value={2}>Remove Governor</option>
    // <option value={3}>Remove Member</option>
    // <option value={4}>Set Proposal Duration</option>
    // <option value={5}>Set Delegation Percentage</option>
    const onProposalChange = (e) => {
        setNewProposalType(e.target.value);
        setShowNewProposalAddress(e.target.value == 1 || e.target.value == 2 || e.target.value == 3);
        setShowNewDelegationPercentage(e.target.value == 5);
        setShowNewProposalDuration(e.target.value == 4);
    };

    const onApplicantCreateClick = ()   => {

    };

    const onProposalCreateSaveClick = async () => {

    };

    const proposalMapping = boardDetail.propsItems.map((prop, index) => {
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
        <div>

            <div className="boarder-member">
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
                <br />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        {boardDetail.boardName}
                    </Col>
                    <Col xs={2} className="item-center">
                        {boardDetail.totalMembers}
                    </Col>
                    <Col xs={5} className="item-center">
                        {boardDetail.boardAddress}
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col xs={3} className="item-center">
                        Member Type
                    </Col>
                    <Col xs={3} className="item-center">
                        Voting Power
                    </Col>
                </Row>
                <br />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        {boardDetail.isGovernor ? "Governor" : "Member"}
                    </Col>
                    <Col xs={3} className="item-center">
                        {boardDetail.votingPower}
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col md={{ span: 3, offset: 4 }} className="item-center">
                        <h3>Proposals</h3>
                    </Col>
                    <Col>
                        <Button onClick={onProposalCreateClick} variant="warning">Create</Button>
                    </Col>
                </Row>
                <hr />
                {proposalMapping}


            </div >
            <Modal size="lg" show={showNewApplicantModal} onHide={handleApplicantClose}>
                <Modal.Header>
                    New Applicant
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Control as="textarea" value={newApplicantDescription} onChange={(e) => { setNewApplicantDescription(e.target.value) }} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onApplicantCreateClick}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" show={showCreateProposalModal} onHide={handleProposalClose}>
                <Modal.Header>
                    Create Proposal
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Description</Form.Label>
                            <Form.Control value={newProposalDescription} onChange={(e) => { setNewProposalDescription(e.target.value) }} as="textarea" />
                        </Form.Group>
                        <Form.Group className="mb-3" >
                            <Form.Label >Proposal Type</Form.Label>
                            <Form.Select
                                value={newProposalType}
                                onChange={onProposalChange}>
                                <option value={0}>Text Based</option>
                                <option value={1}>Add Governor</option>
                                <option value={2}>Remove Governor</option>
                                <option value={3}>Remove Member</option>
                                <option value={4}>Set Proposal Duration</option>
                                <option value={5}>Set Delegation Threshold</option>

                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showNewProposalAddress}>
                            <Form.Label>Address</Form.Label>
                            <Form.Control value={newProposalAddress} onChange={(e) => { setNewProposalAddress(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showNewProposalDuration}>
                            <Form.Label>Proposal Duration in Blocks</Form.Label>
                            <Form.Control value={newProposalDuration} onChange={(e) => { setNewProposalDuration(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showNewDelegationPercentage}>
                            <Form.Label>Proposal Delegation Threshold (0-100%)</Form.Label>
                            <Form.Control value={newProposalDuration} onChange={(e) => { setNewProposalDuration(e.target.value) }} type="text" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onProposalCreateSaveClick}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div >
    )
}


export default Board;