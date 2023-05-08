import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';


//--bootstrap
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';

//--bootstrap

import BoardFactoryInterface from "../web3/interfaces/boardFactory";
import BoardInterface from "../web3/interfaces/board";
import MembersInterface from "../web3/interfaces/members";
import MemberVotesInterface from "../web3/interfaces/memberVotes";

const Board = (props) => {
    const { address } = useParams();

    const [isLoading, setIsLoading] = useState(false);

    const handleProposalClose = () => setShowCreateProposalModal(false);
    const handleProposalShow = () => setShowCreateProposalModal(true);

    const addressZero = '0x0000000000000000000000000000000000000000';

    const [newProposalDescription, setNewProposalDescription] = useState("");
    const [newProposalType, setNewProposalType] = useState("");
    const [newProposalAddress, setNewProposalAddress] = useState(addressZero);
    const [newProposalDelay, setNewProposalDelay] = useState(0);
    const [showNewProposalAddress, setShowNewProposalAddress] = useState(false);
    const [showNewProposalDuration, setShowNewProposalDuration] = useState(false);
    const [newProposalDuration, setNewProposalDuration] = useState(0);
    const [showNewDelegationPercentage, setShowNewDelegationPercentage] = useState(false);
    const [newDelegationPercentage, setNewDelegationPercentage] = useState(0);
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
    const [applicantFeeAmount, setApplicantFeeAmount] = useState(0);
    const [showApplicantFee, setShowApplicantFee] = useState(false);
    const [distributeAmount, setDistributeAmount] = useState(0);
    const [distriubtionAddress, setDistributionAddress] = useState(addressZero);
    const [showDistributeAmount, setShowDistributeAmount] = useState(false);

    const handleApplicantClose = () => setShowNewApplicantModal(false);
    const handleApplicantShow = () => setShowNewApplicantModal(true);

    const [showNewApplicantModal, setShowNewApplicantModal] = useState(false);
    const [newApplicantDescription, setNewApplicantDescription] = useState("");

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [boardDetail, setBoardDetail] = useState({ propsItems: [] });

    const [isMember, setIsMember] = useState(false);


    useEffect(() => {
        onConnect();
    }, []);

    async function onConnect() {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum) {
            var board = await getBoardDetail(address);
            setBoardDetail(board);

        }
    }

    const getBoardDetail = async (boardAddress) => {
        let boardInterface = new BoardInterface(boardAddress);
        let boardFactoryInterface = new BoardFactoryInterface();
        let membersAddress = await boardFactoryInterface.getMembersAddress();
        let memberInterface = new MembersInterface(membersAddress);
        let memberBalance = await memberInterface.balanceOf(window.ethereum.selectedAddress);
        let isMember = parseInt(memberBalance) > 0;
        setIsMember(isMember);
        let boardName = await boardInterface.name();
        let totalMembers = await boardInterface.getTotalMembers();
        let isGovernor = await boardInterface.isGovernor(window.ethereum.selectedAddress);
        var memberVotesAddress = await boardInterface.getMemberVotesAddress();
        let memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
        var votingPower = await memberVotesInterface.getVotes(window.ethereum.selectedAddress);
        let proposals = await boardInterface.getProposals();

        var propsItems = [];

        const web3 = new Web3(window.ethereum);
        const currentBlockNumber = await web3.eth.getBlockNumber();
        console.log(proposals);
        for (var x = 0; x < proposals.length; x++) {
            var proposal = proposals[x];
            var proposalId = proposal.returnValues[0];
            var description = proposal.returnValues[1];
            var pType = proposal.returnValues[2];
            var proposalVotes = await boardInterface.proposalVotes(proposalId);
            var abstainVotes = proposalVotes.abstainVotes;
            var againstVotes = proposalVotes.againstVotes;
            var forVotes = proposalVotes.forVotes;
            var propState = await boardInterface.state(proposalId);
            var propSnapShot = await boardInterface.proposalSnapshot(proposalId);
            var propDeadline = await boardInterface.proposalDeadline(proposalId);

            var secondsUntilStart = (propSnapShot - currentBlockNumber) * 12;
            var secondsUntilEnd = (propDeadline - currentBlockNumber) * 12;

            var hasVoted = await boardInterface.hasVoted(proposalId, window.ethereum.selectedAddress);
            let hideVotebutton = hasVoted || !isMember;

            propsItems.push({
                proposalId,
                description,
                pType,
                abstainVotes,
                againstVotes,
                forVotes,
                propState,
                propSnapShot,
                propDeadline,
                secondsUntilStart,
                secondsUntilEnd,
                hideVotebutton
            });

        }


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

    // 0 TEXT_BASED_PROPOSAL,
    // 1 ADD_GOVERNOR,
    // 2 REMOVE_GOVERNOR,
    // 3 REMOVE_MEMBER,
    // 4 SET_PROPOSAL_DURATION,
    // 5 SET_DELEGATION_THRESHOLD,
    // 6 APPLICANT
    // 7 APPLICANT_FEE,
    // 8 DISTRIBUE_FUNDS
    const onProposalChange = (e) => {
        setNewProposalType(e.target.value);
        setShowNewProposalAddress(e.target.value == 1 || e.target.value == 2 || e.target.value == 3);
        setShowNewDelegationPercentage(e.target.value == 5);
        setShowNewProposalDuration(e.target.value == 4);
        setShowApplicantFee(e.target.value == 7);
        setShowDistributeAmount(e.target.value == 8);
    };

    const onApplicantCreateClick = () => {

    };

    // Against = 0
    // For = 1
    // Abstain = 2
    const onPropVoteClick = async (propId, support) => {
        let boardInterface = new BoardInterface(boardDetail.boardAddress);
        await boardInterface.castVote(propId, support);
        var board = await getBoardDetail(address);
        setBoardDetail(board);
    };

    const onProposalCreateSaveClick = async () => {

        let boardInterface = new BoardInterface(boardDetail.boardAddress);

        if (newProposalDescription.length == 0) {
            setErrorMessage("Description is required");
            setShowError(true);
            return;
        }

        let amount = 0;

        switch (newProposalType) {
            case "1":
            case "2":
            case "3":
                if (newProposalAddress.length == 0) {
                    setErrorMessage("Address is required");
                    setShowError(true);
                    return;
                }
                break;
            case "4":
                amount = newProposalDuration;
                if (newProposalDuration.length == 0 && isNaN(newProposalDuration)) {
                    setErrorMessage("Duration is required and must be a number");
                    setShowError(true);
                    return;
                }
                break;
            case "5":
                amount = newDelegationPercentage;
                if (newDelegationPercentage.length == 0 && isNaN(newDelegationPercentage)) {
                    setErrorMessage("Delegation Percentage is required and must be a number");
                    setShowError(true);
                    return;
                }
                break;
        }

        setIsLoading(true);
        await boardInterface.propose(newProposalDescription, newProposalType, newProposalAddress, amount, newProposalDelay);
        let board = await getBoardDetail(boardDetail.boardAddress);
        setBoardDetail(board);
        handleProposalClose();
    };


    // Pending = 0
    // Active = 1
    // Canceled = 2
    // Defeated = 3
    // Succeeded = 4
    // Queued = 5
    // Expired = 6
    // Executed = 7
    const stateTranslation = (pState) => {
        switch (parseInt(pState)) {
            case 0:
                return "Pending";
            case 1:
                return "Active";
            case 2:
                return "Canceled";
            case 3:
                return "Defeated";
            case 4:
                return "Succeeded";
            case 5:
                return "Queued";
            case 6:
                return "Expired";
            case 7:
                return "Executed";
        }
    };

    const typeTranslation = (pTypeId) => {

        switch (parseInt(pTypeId)) {
            case 0:
                return "Text Based";
            case 1:
                return "Add Governor";
            case 2:
                return "Remove Governor";
            case 3:
                return "Remove Member";
            case 4:
                return "Set Proposal Duration";
            case 5:
                return "Set Delegation Threshold";
            case 6:
                return "Applicant";
        }
    }

    function getFutureDateTime(nSeconds) {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + nSeconds * 1000);
        return formatDateTime(futureDate);
    }

    // Function to format the date/time
    function formatDateTime(dateTime) {
        return dateTime.toLocaleString();
    }

    const proposalMapping = boardDetail.propsItems.map((prop, index) => {
        return (
            <div key={index}>
                <Row>
                    <Col className="item-center">
                        <b>Description</b>
                    </Col>
                </Row>
                <Row>
                    <Col className="item-center">
                        {prop.description}
                    </Col>
                </Row>
                <br />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        Type
                    </Col>
                    <Col xs={3} className="item-center">
                        State
                    </Col>
                    <Col xs={3} className="item-center">
                        Start
                    </Col>
                    <Col xs={3} className="item-center">
                        End
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={3} className="item-center">
                        {typeTranslation(prop.pType)}
                    </Col>
                    <Col xs={3} className="item-center">
                        {stateTranslation(prop.propState)}
                    </Col>
                    <Col xs={3} className="item-center">
                        {getFutureDateTime(prop.secondsUntilStart)}
                    </Col>
                    <Col xs={3} className="item-center">
                        {getFutureDateTime(prop.secondsUntilEnd)}
                    </Col>
                </Row>
                <br />
                <Row className="board-row-item">

                    <Col xs={3} className="item-center">
                        For Votes Count
                    </Col>
                    <Col xs={3} className="item-center">
                        Against Vote Count
                    </Col>
                    <Col xs={3} className="item-center">
                        Abstain Vote Count
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={3} className="item-center">
                        {prop.forVotes}
                    </Col>
                    <Col xs={3} className="item-center">
                        {prop.againstVotes}
                    </Col>
                    <Col xs={3} className="item-center">
                        {prop.abstainVotes}
                    </Col>
                </Row>
                <br />
                <Row hidden={prop.hideVotebutton}>
                    <Col xs={3} className="item-center">

                    </Col>
                    <Col xs={3} className="item-center">
                        <Button variant="warning" onClick={() => { onPropVoteClick(prop.proposalId, 1) }}>For</Button>
                    </Col>
                    <Col xs={3} className="item-center">
                        <Button variant="danger" onClick={() => { onPropVoteClick(prop.proposalId, 0) }}>Against</Button>
                    </Col>
                    <Col xs={3} className="item-center">
                        <Button variant="primary" onClick={() => { onPropVoteClick(prop.proposalId, 2) }}>Abstain</Button>
                    </Col>
                </Row>
                <br />
                <hr />
            </div>

        );
    });


    return (
        <div>

            <Row className="header-wrapper" >
                <Col className="header-text">
                    {boardDetail.boardName}
                </Col>
            </Row>

            <br />

            <Row>
                <Col className="item-center">
                    <b>{boardDetail.boardAddress}</b>
                </Col>
            </Row>

            <hr />

            <Row>
                <Col xs={{ offset: 2, span: 2 }} className="item-center">
                    Total Members
                </Col>
                <Col xs={3} className="item-center">
                    Member Type
                </Col>
                <Col xs={3} className="item-center">
                    Your Voting Power
                </Col>
            </Row>

            <br />

            <Row className="board-row-item">
                <Col xs={{ offset: 2, span: 2 }} className="item-center">
                    {boardDetail.totalMembers}
                </Col>
                <Col xs={3} className="item-center">
                    {boardDetail.isGovernor ? "Governor" : "Member"}
                </Col>
                <Col xs={3} className="item-center">
                    {boardDetail.votingPower}
                </Col>
            </Row>

            <br />
            <br />
            <br />

            <Row>
                <Col md={{ span: 3, offset: 4 }} className="item-center">
                    <h3>Proposals</h3>
                </Col>
                <Col>
                    <Button hidden={!isMember} onClick={onProposalCreateClick} variant="success">Create</Button>
                </Col>
            </Row>

            <hr />

            {proposalMapping}

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

                    <Toast bg="danger" position="top-end" onClose={() => setShowError(false)} show={showError} delay={3000} autohide>
                        <Toast.Body>{errorMessage}</Toast.Body>
                    </Toast>

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
                            <Form.Label>Proposed Address</Form.Label>
                            <Form.Control value={newProposalAddress} onChange={(e) => { setNewProposalAddress(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showNewProposalDuration}>
                            <Form.Label>Proposed Proposal Duration in Blocks</Form.Label>
                            <Form.Control value={newProposalDuration} onChange={(e) => { setNewProposalDuration(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showNewDelegationPercentage}>
                            <Form.Label>Proposed Proposal Delegation Threshold (0-100%)</Form.Label>
                            <Form.Control value={newProposalDuration} onChange={(e) => { setNewProposalDuration(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showApplicantFee}>
                            <Form.Label>Applicant Fee Amount</Form.Label>
                            <Form.Control value={applicantFeeAmount} onChange={(e) => { setApplicantFeeAmount(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showDistributeAmount}>
                            <Form.Label>Proposed Proposal Distribution Amount</Form.Label>
                            <Form.Control value={distributeAmount} onChange={(e) => { setDistributeAmount(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3" hidden={!showDistributeAmount}>
                            <Form.Label>Proposed Proposal Distribution Address</Form.Label>
                            <Form.Control value={distriubtionAddress} onChange={(e) => { setDistributionAddress(e.target.value) }} type="text" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Vote Start Delay</Form.Label>
                            <Form.Control value={newProposalDelay} onChange={(e) => { setNewProposalDelay(e.target.value) }} type="text" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={handleProposalClose}>
                        Cancel
                    </Button>
                    <Button hidden={isLoading} onClick={onProposalCreateSaveClick}>
                        Create
                    </Button>
                    <Spinner hidden={!isLoading} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Modal.Footer>
            </Modal>
        </div >
    )
}


export default Board;