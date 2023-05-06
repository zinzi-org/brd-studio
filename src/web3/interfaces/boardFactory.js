import Web3 from "web3";
import ABI from '../abi/abi_dev.json';

function BoardFactoryInterface(){

    let web3 = new Web3(window.ethereum);
    let memberBoardFactory = new web3.eth.Contract(ABI.governorBoardFactoryABI, ABI.governorBoardFactoryAddress);

    const boardFactory = {
        create: async (newBoardName, symbol) => {
            await memberBoardFactory.methods.create(newBoardName, symbol).send({ from: window.ethereum.selectedAddress })
        },
        isBoard: async (address) => {
            return await memberBoardFactory.methods.isBoard(address).call();
        },
        getMembersAddress: async () => {
            return await memberBoardFactory.methods.membersAddress().call();
        },
        getProjectsAddress: async () => {
            return await memberBoardFactory.methods.projectAddress().call();
        },
        getAllBoards: async () => {
            return await memberBoardFactory.getPastEvents('BoardCreated', {
                fromBlock: 0,
                toBlock: 'latest'
            });
        },
    };
    
    return boardFactory;
}




export default BoardFactoryInterface;