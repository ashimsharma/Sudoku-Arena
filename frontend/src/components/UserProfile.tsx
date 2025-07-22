import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import { HiArrowLeft } from "react-icons/hi";
import axios from "axios";
import checkAuth from "../utils/authentication";

export default function UserProfile() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>();
	const [searchParams] = useSearchParams();
	const userId = searchParams.get("userId");
	const [addButton, setAddButton] = useState("Add");
	const [acceptButton, setAcceptButton] = useState("Accept");
	const [rejectButton, setRejectButton] = useState("Reject");
	const [removeButton, setRemoveButton] = useState("Remove");
	const [friendRequest, setFriendRequest] = useState<any>();
	const [hasRequested, setHasRequested] = useState();
	const [isFriend, setIsFriend] = useState();
	const [isRejected, setIsRejected] = useState();
	const [updateProfile, setUpdateProfile] = useState(false);
	const location = useLocation();
	console.log(location);

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
				`${
					import.meta.env.VITE_API_URL
				}/user/get-user?userId=${userId}`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				if (response.data.data.isSelf) {
					navigate("/profile", {
						state: { from: location?.state?.from },
					});
					return;
				}
				setProfile(response.data.data.user);
				setIsFriend(response.data.data.isFriend);
				setFriendRequest(response.data.data.friendRequest);
				setHasRequested(response.data.data.hasRequested);
				setIsRejected(response.data.data.isRejected);
				setLoading(false);
			} else {
				navigate("/login");
			}
		})();
	}, [updateProfile, userId]);

	const back = () => {
		console.log(location)
		if (location?.state?.from) {
			navigate(location.state.from);
		} else {
			navigate("/");
		}
	};

	const addFriend = async () => {
		try {
			setAddButton("Requesting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/add-friend`,
				{
					userId: profile.id,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setAddButton("Requested");
				setUpdateProfile(!updateProfile);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const rejectFriendRequest = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setRejectButton("Rejecting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/reject-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setRejectButton("Rejected");
				setUpdateProfile(!updateProfile);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const acceptFriendRequest = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setAcceptButton("Accepting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/accept-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setAcceptButton("Accepted");
				setUpdateProfile(!updateProfile);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const removeFriend = async (e: any, requestId: string) => {
		e.stopPropagation();
		try {
			setRemoveButton("Removing...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/remove-friend`,
				{
					requestId: requestId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setRemoveButton("Removed");
				setUpdateProfile(!updateProfile);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return loading ? (
		<p className="text-white">Loading...</p>
	) : (
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
			<div className="max-w-sm mx-auto bg-gray-800 text-white rounded-2xl shadow-xl p-6 space-y-4">
				<div className="flex justify-center h-44">
					<img
						src={profile.avatarUrl}
						alt={profile.name}
						title={profile.name}
						className="h-15 w-15 object-cover rounded-full"
					/>
				</div>

				<div className="text-center">
					<h2 className="text-2xl font-semibold">{profile.name}</h2>
					<p className="text-gray-400">
						Rank:{" "}
						<span className="text-yellow-400 font-medium">
							{profile.rank}
						</span>
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 text-center">
					<div className="">
						<p className="text-sm text-gray-400">Total Games</p>
						<p className="text-xl font-bold">
							{profile.noOfWins +
								profile.noOfDraws +
								profile.noOfLosses}
						</p>
					</div>
					<div className="">
						<p className="text-sm text-gray-400">Friends</p>
						<p className="text-xl font-bold">
							{profile.totalFriends}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 text-center mt-2">
					<div>
						<p className="text-sm text-gray-400">Won</p>
						<p className="text-xl font-bold text-green-400">
							{profile.noOfWins}
						</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Draw</p>
						<p className="text-xl font-bold text-yellow-400">
							{profile.noOfDraws}
						</p>
					</div>
					<div>
						<p className="text-sm text-gray-400">Lost</p>
						<p className="text-xl font-bold text-red-400">
							{profile.noOfLosses}
						</p>
					</div>
				</div>
				{!friendRequest && (
					<button
						className="text-center flex justify-center items-center gap-2 bg-red-500 w-fit px-3 py-1 rounded-lg m-auto cursor-pointer hover:bg-red-600"
						onClick={addFriend}
					>
						{addButton}
					</button>
				)}
				<div className="flex">
					{friendRequest && !isFriend && !hasRequested && (
						<button
							className="text-center flex justify-center items-center gap-2 bg-green-500 w-fit px-3 py-1 rounded-lg m-auto cursor-pointer hover:bg-green-600"
							onClick={(e) =>
								acceptFriendRequest(e, friendRequest?.id)
							}
						>
							{acceptButton}
						</button>
					)}
					{friendRequest && !isFriend && !hasRequested && (
						<button
							className="text-center flex justify-center items-center gap-2 bg-red-500 w-fit px-3 py-1 rounded-lg m-auto cursor-pointer hover:bg-red-600"
							onClick={(e) =>
								rejectFriendRequest(e, friendRequest?.id)
							}
						>
							{rejectButton}
						</button>
					)}
				</div>
				{friendRequest && hasRequested && !isFriend && (
					<button className="text-center flex justify-center items-center gap-2 bg-red-500 w-fit px-3 py-1 rounded-lg m-auto">
						Requested
					</button>
				)}
				{isFriend && (
					<button
						className="text-center flex justify-center items-center gap-2 bg-red-500 w-fit px-3 py-1 rounded-lg m-auto hover:bg-red-600"
						onClick={(e) => removeFriend(e, friendRequest?.id)}
					>
						{removeButton}
					</button>
				)}
			</div>
		</div>
	);
}
