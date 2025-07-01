import axios from "axios";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import checkAuth from "../utils/authentication";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

export default function FriendRequests() {
	const [friendRequests, setFriendRequests] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);
    const [friendRequetsChanged, setFriendRequestsChanged] = useState(false);
    const [acceptButton, setAcceptButton] = useState("Accept");
    const [rejectButton, setRejectButton] = useState("Reject");

	useEffect(() => {
		(async () => {
			const response = await checkAuth();

			if (response) {
				dispatch(setUser({ user: response.data.data.user }));
			} else {
				navigate("/login");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-friend-requests`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setFriendRequests(response.data.data.friendRequests);
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, [friendRequetsChanged]);

	const back = () => {
		navigate("/");
	};

    const rejectFriendRequest = async (e: any, requestId: string) => {
        e.stopPropagation();
        try {
            setRejectButton("Rejecting...")
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/reject-friend`,
				{
					requestId: requestId
				},
				{
					withCredentials: true
				}
			);

			if (response) {
				setRejectButton("Rejected");
                setFriendRequestsChanged(!friendRequetsChanged);
			}
        } catch (error) {
            console.log(error);
        }
    }

    const acceptFriendRequest = async (e: any, requestId: string) => {
        e.stopPropagation();
        try {
            setAcceptButton("Accepting...")
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/accept-friend`,
				{
					requestId: requestId
				},
				{
					withCredentials: true
				}
			);

			if (response) {
				setAcceptButton("Accepted");
                setFriendRequestsChanged(!friendRequetsChanged);
			}
        } catch (error) {
            console.log(error);
        }
    }
	return loading ? (
		<div className="text-white">Loading...</div>
	) : (
		<div className="p-4 bg-gray-900 min-h-screen">
			<div className="flex mb-4">
				<button
					className="flex items-center text-white hover:text-gray-400 transition-all duration-300"
					onClick={back}
				>
					<HiArrowLeft className="text-2xl mr-2" />
					<span className="text-lg font-medium">Back</span>
				</button>
			</div>
			<div>
                {friendRequests.length === 0 && <p className="text-sm text-gray-100 text-center">No new friend requests.</p>}
				{friendRequests.length !== 0 && friendRequests.map((request: any) => (
					<div
						key={request.id}
						className="flex items-center justify-between bg-gray-800 p-3 rounded-lg max-w-lg mx-auto hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/user/profile?userId=${request.requester.id}`)}
					>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
								{request.requester.avatarUrl ? (
									<img
										src={request.requester.avatarUrl}
										alt={request.requester.name}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									request.requester.name[0].toUpperCase()
								)}
							</div>
							<span className="text-white font-medium hover:underline">
								{request.requester.name}
							</span>
						</div>
						<div className="flex space-x-2">
							<button className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600" onClick={(e) => acceptFriendRequest(e, request.id)}>
								{acceptButton}
							</button>
							<button className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600" onClick={(e) => rejectFriendRequest(e, request.id)}>
								{rejectButton}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
