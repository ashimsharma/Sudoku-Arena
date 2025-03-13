import { FaGithub, FaGoogle } from "react-icons/fa";

export default function Login() {
    const loginWithGithub = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/auth/github`, '_self')
    }

    const loginWithGoogle = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/auth/google`, '_self')
    }

    return (
        <>
            <div className="w-100 h-screen bg-black flex justify-center items-center">
                <div className="flex flex-col gap-4">
                    <button className="text-white bg-gray-600 p-2 flex items-center gap-2 hover:bg-gray-700" onClick={loginWithGithub}>
                        <p>Login with Github</p>
                        <div>
                            <FaGithub size={20} />
                        </div>
                    </button>
                    <button className="text-white bg-gray-600 p-2 flex items-center gap-2 hover:bg-gray-700" onClick={loginWithGoogle}>
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
