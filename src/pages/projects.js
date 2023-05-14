import React, { useState, useEffect, useCallback } from "react";

import Web3 from 'web3';

import { useEthereum } from '../ethContext';

const Projects = () => {

    const { address, balance, isConnected, isProvider, provider } = useEthereum();



    return (
        <div>
            <h1>Projects</h1>
        </div>
    )
}


export default Projects;