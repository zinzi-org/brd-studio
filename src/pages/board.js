import React, { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';

import Web3 from 'web3';

import { useEthereum } from '../ethContext';

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

const Board = () => {
    const { boardAddress } = useParams();

    const { selectedAddress, balance, isConnected, isProvider, provider } = useEthereum();

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

    const [showDelegateModal, setShowDelegateModal] = useState(false);

    const handleCloseDelegateModal = () => setShowDelegateModal(false);
    const handleShowDelegateModal = () => setShowDelegateModal(true);

    const [delegateToAddress, setDelegateToAddress] = useState("");

    const [showNewApplicantModal, setShowNewApplicantModal] = useState(false);
    const [newApplicantDescription, setNewApplicantDescription] = useState("");

    const [newApplicants, setNewApplicants] = useState([]);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [boardDetail, setBoardDetail] = useState({ propsItems: [] });

    const [isMember, setIsMember] = useState(false);
    const [isGovernor, setIsGovernor] = useState(false);
    const [hasDelegation, setHasDelgation] = useState(false);

    const getAndSetApplicants =  useCallback(async () => {
        let boardInterface = new BoardInterface(boardAddress);
        let applicants = await boardInterface.getMemberProposals();
        let boardFactoryInterface = new BoardFactoryInterface();
        let membersAddress = await boardFactoryInterface.getMembersAddress();
        let memberInterface = new MembersInterface(membersAddress);

        var applicantItems = [];

        for (var i = 0; i < applicants.length; i++) {
            var applicant = applicants[i];

            var proposalId = applicant.returnValues[1];
            var applicantAddress = applicant.returnValues[0];
            var applicantDescription = applicant.returnValues[2];

            var applicantBalance = await memberInterface.balanceOf(applicantAddress);
            if (parseInt(applicantBalance) === 0) {
                var proposalState = parseInt(await boardInterface.state(proposalId));
                if (proposalState === 0 || proposalState === 1 || proposalState === 5) {
                    var detail = await boardInterface.proposalDetail(proposalId);
                    var abstainVotes = detail.abstainVotes;
                    var againstVotes = detail.againstVotes;
                    var forVotes = detail.forVotes;
                    var hasVoted = detail.hasVoted;
                    var propSnapShot = detail.voteStart;
                    var propDeadline = detail.voteEnd;
                    var propState = await boardInterface.state(proposalId);
                    const web3 = new Web3(provider);
                    const currentBlockNumber = await web3.eth.getBlockNumber();
                    var secondsUntilStart = (propSnapShot - currentBlockNumber) * 12;
                    var secondsUntilEnd = (propDeadline - currentBlockNumber) * 12;
                    let hideVotebutton = hasVoted || !isMember;
                    applicantItems.push({
                        address: applicantAddress,
                        description: applicantDescription,
                        proposalId,
                        abstainVotes,
                        againstVotes,
                        forVotes,
                        hasVoted,
                        hideVotebutton,
                        secondsUntilStart,
                        secondsUntilEnd,
                        propState
                    });
                }
            }
        }

        setNewApplicants(applicantItems);
    }, [boardAddress, isMember, provider]);

    const getAndSetBoardDetail = useCallback(async (isMember) => {
        let boardInterface = new BoardInterface(boardAddress);
        let boardName = await boardInterface.name();
        let totalMembers = await boardInterface.getTotalMembers();
        var memberVotesAddress = await boardInterface.getMemberVotesAddress();
        let isGovernor = false;
        var votingPower = 0;
        let hasDelegated = false;
        if (selectedAddress) {
            let memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
            let delegatedAddress = await memberVotesInterface.delegateSafeCheck(selectedAddress);
            hasDelegated = delegatedAddress.toLowerCase() !== selectedAddress.toLowerCase();
            isGovernor = await boardInterface.isGovernor(selectedAddress);
            votingPower = parseInt(await memberVotesInterface.getVotes(selectedAddress));
        }

        let proposals = await boardInterface.getProposals();

        var propsItems = [];

        const web3 = new Web3(provider);
        const currentBlockNumber = await web3.eth.getBlockNumber();

        for (var x = 0; x < proposals.length; x++) {
            var proposal = proposals[x];
            var proposalId = proposal.returnValues[0];
            var description = proposal.returnValues[1];
            var pType = proposal.returnValues[2];
            var detail = await boardInterface.proposalDetail(proposalId);

            var abstainVotes = detail.abstainVotes;
            var againstVotes = detail.againstVotes;
            var forVotes = detail.forVotes;
            var propState = parseInt(await boardInterface.state(proposalId));
            var propSnapShot = detail.voteStart;
            var propDeadline = detail.voteEnd;

            var secondsUntilStart = (propSnapShot - currentBlockNumber) * 12;
            var secondsUntilEnd = (propDeadline - currentBlockNumber) * 12;

            var hasVoted = detail.hasVoted;
            let hideVotebutton = !isMember && !isGovernor;
            let noVotingPower = votingPower === 0 || hasVoted;
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
                hideVotebutton,
                noVotingPower,
                isActive: propState === 0 || propState === 1 || propState === 5
            });

        }

        setBoardDetail({
            boardName: boardName,
            totalMembers: totalMembers,
            isGovernor: isGovernor,
            hasDelegated: hasDelegated,
            votingPower: votingPower,
            boardAddress: boardAddress,
            propsItems: propsItems
        });
    }, [boardAddress, selectedAddress, provider]);

    const onConnect = useCallback(async () => {
        let isMemberLocal = false;
        if (isConnected) {
            let boardFactoryInterface = new BoardFactoryInterface();
            let membersAddress = await boardFactoryInterface.getMembersAddress();
            let memberInterface = new MembersInterface(membersAddress);
            let memberBalance = await memberInterface.balanceOf(selectedAddress);
            isMemberLocal = parseInt(memberBalance) > 0;
            let boardInterface = new BoardInterface(boardAddress);
            let isGovernor = await boardInterface.isGovernor(selectedAddress);
            let hasDelegation = await boardInterface.memberHasDelegation(selectedAddress);
            setIsGovernor(isGovernor);
            setHasDelgation(hasDelegation);
            setIsMember(isMemberLocal);
        }
        await getAndSetBoardDetail(isMemberLocal);
        await getAndSetApplicants();
    }, [isConnected, selectedAddress, getAndSetBoardDetail, getAndSetApplicants, boardAddress]);



    useEffect(() => {
        if(isProvider){
            onConnect();
        }
    }, [isProvider, onConnect]);




    const onProposalCreateClick = async () => {
        handleProposalShow();
        setNewProposalDescription("");
        setNewProposalType(0);
    };

    const onProposalChange = (e) => {
        var value = parseInt(e.target.value);

        // 0 TEXT_BASED_PROPOSAL,
        //Always show text box
        setNewProposalType(value);
        // 1 ADD_GOVERNOR,
        // 2 REMOVE_GOVERNOR,
        // 3 REMOVE_MEMBER,
        setShowNewProposalAddress(value === 1 || value === 2 || value === 3);
        // 5 SET_DELEGATION_THRESHOLD,
        setShowNewDelegationPercentage(value === 5);
        // 4 SET_PROPOSAL_DURATION,
        setShowNewProposalDuration(value === 4);
        // 7 APPLICANT_FEE,
        setShowApplicantFee(value === 7);
        // 8 DISTRIBUE_FUNDS
        setShowDistributeAmount(value === 8);
    };

    // 6 APPLICANT
    const onApplicantCreateClick = async () => {
        setIsLoading(true);
        let boardInterface = new BoardInterface(boardAddress);
        var fee = await boardInterface.getApplicantFee();
        await boardInterface.proposeMember(newApplicantDescription, selectedAddress, fee);
        await getAndSetApplicants();
        handleApplicantClose();
        setIsLoading(false);

    };

    // Against = 0
    // For = 1
    // Abstain = 2
    const onPropVoteClick = async (propId, support) => {
        let boardInterface = new BoardInterface(boardAddress);
        await boardInterface.castVote(propId, support);
        await getAndSetBoardDetail(isMember);
    };

    const onProposalCreateSaveClick = async () => {

        let boardInterface = new BoardInterface(boardAddress);

        if (newProposalDescription.length === 0) {
            setErrorMessage("Description is required");
            setShowError(true);
            return;
        }

        let amount = 0;

        switch (newProposalType) {
            case "1":
            case "2":
            case "3":
                if (newProposalAddress.length === 0) {
                    setErrorMessage("Address is required");
                    setShowError(true);
                    return;
                }
                break;
            case "4":
                amount = newProposalDuration;
                if (newProposalDuration.length === 0 && isNaN(newProposalDuration)) {
                    setErrorMessage("Duration is required and must be a number");
                    setShowError(true);
                    return;
                }
                break;
            case "5":
                amount = newDelegationPercentage;
                if (newDelegationPercentage.length === 0 && isNaN(newDelegationPercentage)) {
                    setErrorMessage("Delegation Percentage is required and must be a number");
                    setShowError(true);
                    return;
                }
                break;
            default:
                console.log("Unsupported proposal Type", newProposalType);
                break;
        }

        setIsLoading(true);
        await boardInterface.propose(newProposalDescription, newProposalType, newProposalAddress, amount, newProposalDelay);
        await getAndSetBoardDetail(isMember);
        handleProposalClose();
    };


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
            default:
                return "Unknown";
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
            default:
                return "Unknown";

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

    // TEXT_BASED_PROPOSAL 0
    // ADD_GOVERNOR 1
    // REMOVE_GOVERNOR 2
    // REMOVE_MEMBER 3
    // SET_PROPOSAL_DURATION 4
    // SET_DELEGATION_THRESHOLD 5
    // APPLICANT 6
    // APPLICANT_FEE 7
    // DISTRIBUE_FUNDS 8
    const executeProposal = async (propType, propId) => {
        let boardInterface = new BoardInterface(boardAddress);

        switch (propType) {
            case 1:
                await boardInterface.addGovernor(propId);
                break;
            case 2:
                await boardInterface.removeGovernor(propId);
                break;
            case 3:
                await boardInterface.removeMember(propId);
                break;
            case 4:
                await boardInterface.setProposalDuration(propId);
                break;
            case 5:
                await boardInterface.setDelegationThreshold(propId);
                break;
            case 6:
                await boardInterface.addMemberWithProposal(propId);
                break;
            case 7:
                await boardInterface.setApplicantFee(propId);
                break;
            case 8:
                await boardInterface.distributeFunds(propId);
                break;
            default:
                console.log("Unsupported proposal Type", propType);
                break;
        }

        await getAndSetApplicants();
        await getAndSetBoardDetail(isMember);
    };

    const onVoteDelegateClick = async () => {
        isLoading(true);
        let boardInterface = new BoardInterface(boardAddress);
        var memberVotesAddress = await boardInterface.getMemberVotesAddress();
        var memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
        await memberVotesInterface.delegate(delegateToAddress, selectedAddress, distriubtionAddress);
        await getAndSetBoardDetail(isMember);
        handleCloseDelegateModal(isMember);
        isLoading(false);
    };

    const onReclaimDelegateClick = async () => {
        let boardInterface = new BoardInterface(boardAddress);
        var memberVotesAddress = await boardInterface.getMemberVotesAddress();
        var memberVotesInterface = new MemberVotesInterface(memberVotesAddress);
        await memberVotesInterface.reclaimVote();
        await getAndSetBoardDetail(isMember);
    };



    const newApplicantList = newApplicants.map((applicant, index) => {
        return (
            <div key={index}>
                <Row>
                    <Col className="item-center">
                        <b>Description</b>
                    </Col>
                </Row>
                <Row>
                    <Col className="item-center">
                        {applicant.description}
                    </Col>
                </Row>
                <br />
                <Row className="board-row-item">
                    <Col xs={3} className="item-center">
                        Applicant Address
                    </Col>
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
                        {applicant.address}
                    </Col>
                    <Col xs={3} className="item-center">
                        {applicant.forVotes}
                    </Col>
                    <Col xs={3} className="item-center">
                        {applicant.againstVotes}
                    </Col>
                    <Col xs={3} className="item-center">
                        {applicant.abstainVotes}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={3} className="item-center">
                        <Button variant="success" disabled={!isGovernor} onClick={(e) => { executeProposal(6, applicant.proposalId) }}>Execute</Button>
                    </Col>
                    <Col hidden={applicant.hideVotebutton} xs={3} className="item-center">
                        <Button variant="warning" onClick={() => { onPropVoteClick(applicant.proposalId, 1) }}>For</Button>
                    </Col>
                    <Col hidden={applicant.hideVotebutton} xs={3} className="item-center">
                        <Button variant="danger" onClick={() => { onPropVoteClick(applicant.proposalId, 0) }}>Against</Button>
                    </Col>
                    <Col hidden={applicant.hideVotebutton} xs={3} className="item-center">
                        <Button variant="primary" onClick={() => { onPropVoteClick(applicant.proposalId, 2) }}>Abstain</Button>
                    </Col>
                </Row>
                <br />
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
                        New Applicant
                    </Col>
                    <Col xs={3} className="item-center">
                        {stateTranslation(applicant.propState)}
                    </Col>
                    <Col xs={3} className="item-center">
                        {getFutureDateTime(applicant.secondsUntilStart)}
                    </Col>
                    <Col xs={3} className="item-center">
                        {getFutureDateTime(applicant.secondsUntilEnd)}
                    </Col>
                </Row>
                <br />
                <hr />
            </div>
        )
    });

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

                    </Col>
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

                    </Col>
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
                        <Button variant="success" disabled={prop.isActive} onClick={(e) => { executeProposal(prop.pType, prop.proposalId) }} >Execute</Button>
                    </Col>
                    <Col xs={3} className="item-center">
                        <Button disabled={prop.noVotingPower} variant="warning" onClick={() => { onPropVoteClick(prop.proposalId, 1) }}>For</Button>
                    </Col>
                    <Col xs={3} className="item-center">
                        <Button disabled={prop.noVotingPower} variant="danger" onClick={() => { onPropVoteClick(prop.proposalId, 0) }}>Against</Button>
                    </Col>
                    <Col xs={3} className="item-center">
                        <Button disabled={prop.noVotingPower} variant="primary" onClick={() => { onPropVoteClick(prop.proposalId, 2) }}>Abstain</Button>
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

            <Row hidden={isMember || !isConnected}>
                <Button variant="success" onClick={handleApplicantShow}>
                    Submit Application
                </Button>
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
                    {isMember ? boardDetail.isGovernor ? "Governor" : "Member" : "Not a Member"}
                </Col>
                <Col xs={3} className="item-center">
                    <Button hidden={!boardDetail.hasDelegated} variant="danger" onClick={onReclaimDelegateClick}>Reclaim Vote</Button>
                    <Button hidden={boardDetail.hasDelegated || !isMember} variant="warning" onClick={handleShowDelegateModal}>Delegate</Button>
                    <br />
                    {boardDetail.votingPower}
                </Col>
            </Row>

            <br />
            <br />
            <br />

            <Row>
                <Col className="item-center">
                    <h3>New Member Applicants</h3>
                </Col>
            </Row>

            <hr />
            {newApplicantList}
            <br />
            <br />
            <br />

            <Row>
                <Col md={{ span: 3, offset: 4 }} className="item-center">
                    <h3>Proposals</h3>
                </Col>
                <Col>
                    <Button hidden={!isMember} onClick={onProposalCreateClick} variant="success" disabled={!isGovernor || hasDelegation}>Create</Button>
                </Col>
            </Row>

            <hr />

            {proposalMapping}

            <Modal show={showDelegateModal} onHide={handleCloseDelegateModal}>
                <Modal.Header>
                    <b>Delegate</b>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Delegate To Address</Form.Label>
                            <Form.Control value={delegateToAddress} onChange={(e) => { setDelegateToAddress(e.target.value) }} type="text" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Spinner hidden={!isLoading} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <Button hidden={isLoading} variant="warning" onClick={handleCloseDelegateModal}>
                        Cancel
                    </Button>
                    <Button hidden={isLoading} variant="success" onClick={onVoteDelegateClick}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" show={showNewApplicantModal} onHide={handleApplicantClose}>
                <Modal.Header>
                    <b>Application</b>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" >
                            <Form.Label>Please Describe Yourself</Form.Label>
                            <Form.Control as="textarea" value={newApplicantDescription} onChange={(e) => { setNewApplicantDescription(e.target.value) }} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button hidden={isLoading} onClick={onApplicantCreateClick}>
                        Submit
                    </Button>
                    <Spinner hidden={!isLoading} animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
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
                                <option value={7}>Set Application Fee</option>
                                <option value={8}>Distribute Funds</option>
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
                            <Form.Control value={newProposalDuration} onChange={(e) => { setNewDelegationPercentage(e.target.value) }} type="text" />
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
                    <Button hidden={isLoading} variant="warning" onClick={handleProposalClose}>
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