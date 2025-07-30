import { FaGithub, FaGoogle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import {ErrorMessage} from "./";
import { useState } from "react";

export default function Login() {
    const loginWithGithub = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/auth/github`, '_self')
    }

    const loginWithGoogle = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/auth/google`, '_self')
    }

    const [searchParams] = useSearchParams();
    const [errorVisible, setErrorVisible] = useState(searchParams.get("error") ? true : false)
    
    const navigate = useNavigate();

    const closeError = () => {
        setErrorVisible(false)
        navigate("/login")
    }

    return (
        <>
            {searchParams.get("error") === "github-oauth-failed" && <ErrorMessage visible={errorVisible} message="Failed to login using Github. Try making your Email public on Github or login using another method." onClose={closeError} />}
            {searchParams.get("error") === "google-oauth-failed" && <ErrorMessage visible={errorVisible} message="Failed to login using Google. Try again later." onClose={closeError} />}
            <div className="w-100 h-screen bg-gray-900 flex justify-center items-center">
                <div className="flex flex-col gap-4 bg-gray-800 p-20 rounded-lg">
                    <button className="text-white bg-red-500 px-6 py-2 rounded-md flex justify-center items-center gap-2 hover:bg-red-600" onClick={loginWithGithub}>
                        <p>Login with Github</p>
                        <div>
                            <FaGithub size={20} />
                        </div>
                    </button>
                    <button className="text-white bg-red-500 px-6 py-2 rounded-md flex justify-center items-center gap-2 hover:bg-red-600" onClick={loginWithGoogle}>
                        <p>Login with Google</p>
                        <div>
                            <FaGoogle size={20} />
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
