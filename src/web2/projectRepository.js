import axios from 'axios';

const PROJECT_API_BASE_URL = "http://localhost:7080/api/project";

class ProjectService {
    
        async getProjects(){
            return await axios.get(PROJECT_API_BASE_URL + '/getall');
        }
    
        async createProject(project){
            return await axios.post(PROJECT_API_BASE_URL, project);
        }
    
        async getProjectById(projectId){
            return await axios.get(PROJECT_API_BASE_URL + '/' + projectId);
        }
    
        async updateProject(project, projectId){
            return await axios.put(PROJECT_API_BASE_URL + '/' + projectId, project);
        }
    
    }

export default new ProjectService();