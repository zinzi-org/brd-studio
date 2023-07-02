import React, { useState, useEffect, useCallback } from "react";

import Web3 from 'web3';

import { useEthereum } from '../ethContext';

import ProjectService from "../web2/projectRepository";



//--bootstrap
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
//--bootstrap

const Projects = () => {

    const { address, balance, isConnected, isProvider, provider } = useEthereum();

    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");

    const handleCreateClose = () => setShowCreateBoardModal(false);
    const handleCreateShow = () => setShowCreateBoardModal(true);

    const getProjects = useCallback(async () => {
        let projectService = new ProjectService();
        let projects = await projectService.getProjects();
        console.log(projects);
    }, []);

    useEffect(() => {
        getProjects();
    }, [getProjects]);

    const createProject = async ()  => {
        let projectService = new ProjectService();
        let project = {
            name: newProjectName,
            description: newProjectDescription
        };
        await projectService.createProject(project);
        handleCreateClose();
        getProjects();
    };

    return (
        <div>
            <Row className="header-wrapper" >
                <Col className="header-text">
                    Projects
                </Col>
                <Col>
                    <Button variant="primary" onClick={handleCreateShow}>Create Project</Button>
                </Col>
            </Row>

            <Modal show={showCreateBoardModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control value={newProjectName} onChange={(e) => {setNewProjectName(e.target.value)}} type="text" placeholder="Enter project name" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Description</Form.Label>
                            <Form.Control value={newProjectDescription} onChange={(e) => {setNewProjectDescription(e.target.value)}} type="text" placeholder="Enter project description" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateClose}>
                        Close
                    </Button>
                    <Button onClick={createProject} variant="primary">
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}


export default Projects;