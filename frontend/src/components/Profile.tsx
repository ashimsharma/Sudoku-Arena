import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { setUser } from "../redux/userSlice";
import { HiArrowLeft } from "react-icons/hi";

export default function Profile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
    const user = useSelector((state: any) => state.user).user;

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, []);

	const back = () => {
		navigate("/");
	};

	return (
        loading ? <p className="text-white">Loading...</p> :
		<div className="min-h-screen bg-gray-900 p-4">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
            <div className="p-3 bg-gray-700 w-1/2 rounded-lg m-auto grid grid-cols-5 justify-center">
                <div className="col-span-2 flex flex-col">
                    <div className="flex justify-center">
                        <img src={user.avatarUrl} alt="Avatar URL" className="w-52 h-52 rounded-full"/>
                    </div>
                    <div className="text-white text-[40px] text-center">{user.name}</div>
                </div>
                <div className="col-span-3 flex justify-center items-center">
                    <div className="bg-gray-800 grid grid-cols-4 rounded-lg gap-4 p-2 text-gray-300">
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="text-[25px]">Total</h1>
                            <div className="text-xl">{user.noOfWins + user.noOfLosses + user.noOfDraws}</div>
                        </div>
                        <div className="flex flex-col justify-center items-center text-green-500">
                            <h1 className="text-[25px]">Won</h1>
                            <div className="text-xl">{user.noOfWins}</div>
                        </div>
                        <div className="flex flex-col justify-center items-center text-yellow-500">
                            <h1 className="text-[25px]">Draw</h1>
                            <div className="text-xl">{user.noOfDraws}</div>
                        </div>
                        <div className="flex flex-col justify-center items-center text-red-500">
                            <h1 className="text-[25px]">Lost</h1>
                            <div className="text-xl">{user.noOfLosses}</div>
                        </div>
                    </div>
                </div>
            </div>
		</div>
	);
}
