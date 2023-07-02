import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function ProjectInterface() {
    let web3 = new Web3(window.ethereum);
    let projectContract = new web3.eth.Contract(ABI.projectABI, ABI.projectAddress);

    const projectInstance = {
        mintProject: async (nameP, summary, flow, funding, ownerBudgetAmount) => {
            await projectContract.methods.mintProject(nameP, summary, flow, funding, ownerBudgetAmount).send({ from: window.ethereum.selectedAddress });
        },
        updateProjectHash: async (tokenId, nameP, summary, flow, funding) => {
            await projectContract.methods.updateProjectHash(tokenId, nameP, summary, flow, funding).send({ from: window.ethereum.selectedAddress });
        },
        updateProjectAmount: async (tokenId, amount) => {
            await projectContract.methods.updateProjectAmount(tokenId, amount).send({ from: window.ethereum.selectedAddress });
        },
        createProposal: async (memberId, projectId, summary, amountNeeded, timeNeeded) => {
            await projectContract.methods.createProposal(memberId, projectId, summary, amountNeeded, timeNeeded).send({ from: window.ethereum.selectedAddress });
        },
        updateProposal: async (projectTokenId, proposalIndex, summary, amountNeeded, timeNeeded) => {
            await projectContract.methods.updateProposal(projectTokenId, proposalIndex, summary, amountNeeded, timeNeeded).send({ from: window.ethereum.selectedAddress });
        },
        cancelProposal: async (projectTokenId, proposalIndex) => {
            await projectContract.methods.cancelProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress });
        },
        completeProposal: async (tokenId) => {
            await projectContract.methods.completeProposal(tokenId).send({ from: window.ethereum.selectedAddress });
        },
        disputeProposal: async (tokenId) => {
            await projectContract.methods.disputeProposal(tokenId).send({ from: window.ethereum.selectedAddress });
        },
        approveProposal: async (projectTokenId, proposalIndex) => {
            await projectContract.methods.approveProposal(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress })
        },
        castVote: async (projectTokenId, proposalIndex) => {
            await projectContract.methods.castVote(projectTokenId, proposalIndex).send({ from: window.ethereum.selectedAddress })
        },
        getVotes: async (projectTokenId, proposalIndex) => {
            return await projectContract.methods.getVotes(projectTokenId, proposalIndex).call()
        },
        hasVoted: async (projectTokenId, account) => {
            return await projectContract.methods.hasVoted(projectTokenId, account).call()
        },
        projectState: async (projectTokenId) => {
            return await projectContract.methods.projectState(projectTokenId).call()
        },
        proposalDeadline: async (projectTokenId) => {
            return await projectContract.methods.proposalDeadline(projectTokenId).call()
        },
        votingPeriod: async () => {
            return await projectContract.methods.votingPeriod().call()
        },
        setProposalFee: async (newFee, tokenId) => {
            await projectContract.methods.setProposalFee(newFee, tokenId).send({ from: window.ethereum.selectedAddress })
        },
        supportsInterface: async (interfaceId) => {
            return await projectContract.methods.supportsInterface(interfaceId).call()
        },
        balanceOf: async (owner_) => {
            return await projectContract.methods.balanceOf(owner_).call()
        },
        ownerOf: async (tokenId) => {
            return await projectContract.methods.ownerOf(tokenId).call()
        },
        tokenURI: async (tokenId) => {
            return await projectContract.methods.tokenURI(tokenId).call()
        },
        approve: async (to, tokenId) => {
            await projectContract.methods.approve(to, tokenId).send({ from: window.ethereum.selectedAddress })
        },
        getApproved: async (tokenId) => {
            return await projectContract.methods.getApproved(tokenId).call()
        },
        setApprovalForAll: async (operator, approved) => {
            await projectContract.methods.setApprovalForAll(operator, approved).send({ from: window.ethereum.selectedAddress })
        },
        isApprovedForAll: async (tokeOwner, operator) => {
            return await projectContract.methods.isApprovedForAll(tokeOwner, operator).call()
        },
        transferFrom: async (from, to, tokenId) => {
            await projectContract.methods.transferFrom(from, to, tokenId).send({ from: window.ethereum.selectedAddress })
        },
        safeTransferFrom: async (from, to, tokenId) => {
            await projectContract.methods.safeTransferFrom(from, to, tokenId).send({ from: window.ethereum.selectedAddress })
        },
        safeTransferFromWithData: async (from, to, tokenId, data) => {
            await projectContract.methods.safeTransferFrom(from, to, tokenId, data).send({ from: window.ethereum.selectedAddress })
        }
    };

    return projectInstance;
};

export default ProjectInterface;

