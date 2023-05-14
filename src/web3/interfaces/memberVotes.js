import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function MemberVotesInterface(address) {

    let web3 = new Web3(window.ethereum);
    const memberVoteContract = new web3.eth.Contract(ABI.memberVotesABI, address);

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
        delegate: async function (delegatee) {
            await memberVoteContract.methods.delegate(delegatee).send({ from: window.ethereum.selectedAddress });
        },
        reclaimVote: async function () {
            await memberVoteContract.methods.reclaimVote().send({ from: window.ethereum.selectedAddress });
        }
    };
}


export default MemberVotesInterface;
