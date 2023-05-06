import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function MembersInterface(memberNFTAddress){

    let web3 = new Web3(window.ethereum);
    let memberBoardNFT = new web3.eth.Contract(ABI.membersABI, memberNFTAddress);

    const members = {
        name: async () => {
            return await memberBoardNFT.methods.name().call();
        },
        symbol: async () => {
            return await memberBoardNFT.methods.symbol().call();
        },
        mintTo: async (newMemberAddress, boardAddress) => {
            await memberBoardNFT.methods.mintTo(newMemberAddress, boardAddress)
                .send({ from: window.ethereum.selectedAddress });
        },
        mintToFirst: async (newMemberAddress, boardAddress) => {
            await memberBoardNFT.methods.mintToFirst(newMemberAddress, boardAddress)
                .send({ from: window.ethereum.selectedAddress });
        },
        tokenURI: async (tokenId) => {
            await memberBoardNFT.methods.tokenURI(tokenId).call();
        },
        getBoards: async (address) => {
            return await memberBoardNFT.methods.getBoards(address).call();
        },
        getBoardForToken: async (tokenId) => {
            return await memberBoardNFT.methods.getBoardForToken(tokenId).call();
        }
    };

    return members;
}


export default MembersInterface;