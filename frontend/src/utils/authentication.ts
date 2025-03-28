import axios from "axios";

const checkAuth = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-auth`, {
            withCredentials: true
        });

        if(response){
            return response;
        }
        else{
            return false;
        }
    } catch (error) {
        return false;
    }
}

export default checkAuth;