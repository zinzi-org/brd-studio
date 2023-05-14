import React, { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';

import Web3 from 'web3';

import { useEthereum } from '../ethContext';

const Project = () => {

    const { projectAddress } = useParams();
    
    const { address, balance, isConnected, isProvider, provider } = useEthereum();

    return (
        <div>
            <h1>Project</h1>
        </div>
    )
}


export default Project;