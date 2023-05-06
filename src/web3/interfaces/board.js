import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function BoardInterface(address) {
    let web3 = new Web3(window.ethereum);
    var contractInstance = new web3.eth.Contract(ABI.governorBoardABI, address);
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
        removeGovernor: async (propId) => {
            await contractInstance.methods.removeGovernor(propId).send({ from: window.ethereum.selectedAddress });
        },
        addMember: async (address) => {
            await contractInstance.methods.addMember(address).send({ from: window.ethereum.selectedAddress });
        },
        removeMember: async (propId) => {
            await contractInstance.methods.removeMember(propId).send({ from: window.ethereum.selectedAddress });
        },
        setProposalDuration: async (propId) => {
            await contractInstance.methods.setProposalDuration(propId).send({ from: window.ethereum.selectedAddress });
        },
        setDelegationThreshold: async (propId) => {
            await contractInstance.methods.setDelegationThreshold(propId).send({ from: window.ethereum.selectedAddress });
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
        propose: async (description, pType, address, amount, votingDelay) => {
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
                return await contractInstance.current.getPastEvents('Proposal', {
                    fromBlock: 0,
                    toBlock: 'latest'
                });
            } catch (e) {
                console.log(e);
                return [];
            }

        },
        getMemberApprovals: async () => {
            return await contractInstance.current.getPastEvents('ApproveMember', {
                fromBlock: 0,
                toBlock: 'latest'
            });
        },
        getGovernorApprovals: async () => {
            return await contractInstance.current.getPastEvents('AddGovernor', {
                fromBlock: 0,
                toBlock: 'latest'
            });
        }
    }
}


export default BoardInterface;