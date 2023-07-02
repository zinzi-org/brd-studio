import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function TaskInterface() {
    let web3 = new Web3(window.ethereum);
    let taskContract = new web3.eth.Contract(ABI.taskABI, ABI.taskAddress);

    const taskInstance = {
        createProject: async (projectName, summary) => {
            await taskContract.methods.createProject(projectName, summary).send({ from: window.ethereum.selectedAddress });
        },
        updateProjectHash: async (tokenId, projectName, projectSummary) => {
            await taskContract.methods.updateProjectHash(tokenId, projectName, projectSummary).send({ from: window.ethereum.selectedAddress });
        },
        increaseProjectFunding: async (projectTokenId) => {
            await taskContract.methods.increaseProjectFunding(projectTokenId).send({ from: window.ethereum.selectedAddress });
        },
        completeProject: async (tokenId) => {
            await taskContract.methods.completeProject(tokenId).send({ from: window.ethereum.selectedAddress });
        },
        cancelProject: async (tokenId) => {
            await taskContract.methods.cancelProject(tokenId).send({ from: window.ethereum.selectedAddress });
        },
        createProposal: async (memberTokenId, projectId, summary, timeNeeded) => {
            await taskContract.methods.createProposal(memberTokenId, projectId, summary, timeNeeded).send({ from: window.ethereum.selectedAddress });
        },
        updateProposal: async (projectTokenId, proposalIndex, summary, timeNeeded) => {
            await taskContract.methods.updateProposal(projectTokenId, proposalIndex, summary, timeNeeded).send({ from: window.ethereum.selectedAddress });
        },
        completeProposal: async (projectTokenId, proposalIndex) => {
            await taskContract.methods.completeProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress });
        },
        cancelProposal: async (projectTokenId, proposalIndex) => {
            await taskContract.methods.cancelProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress });
        },
        disputeProposal: async (tokenId, reason) => {
            await taskContract.methods.disputeProposal(tokenId, reason).send({ from: window.ethereum.selectedAddress });
        },
        ownerApproveProposal: async (projectTokenId, proposalIndex) => {
            await taskContract.methods.ownerApproveProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress });
        },
        approveProposal: async (projectTokenId, proposalIndex) => {
            await taskContract.methods.approveProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress });
        },
        getProjectDetails: async (projectTokenId) => {
            return await taskContract.methods.getProjectDetails(projectTokenId).call({ from: window.ethereum.selectedAddress });
        },
        projectState: async (projectTokenId) => {
            return await taskContract.methods.projectState(projectTokenId).call({ from: window.ethereum.selectedAddress });
        },
        generateProjectHash: async (projectName, projectSummary) => {
            return await taskContract.methods.generateProjectHash(projectName, projectSummary).call({ from: window.ethereum.selectedAddress });
        },
        getProposalDetails: async (projectTokenId, proposalIndex) => {
            return await taskContract.methods.getProposalDetails(projectTokenId, proposalIndex).call({ from: window.ethereum.selectedAddress });
        },
        generateProposalHash: async (summary, projectId, memberId) => {
            return await taskContract.methods.generateProposalHash(summary, projectId, memberId).call({ from: window.ethereum.selectedAddress });
        },
        getTotalBalance: async () => {
            return await taskContract.methods.getTotalBalance().call({ from: window.ethereum.selectedAddress });
        }
    };

    return taskInstance;
};


export default TaskInterface;

