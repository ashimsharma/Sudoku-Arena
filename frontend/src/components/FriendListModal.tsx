import axios from "axios";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

const FriendListModal = ({ setOpenFriendList, gameId, user }: any) => {
	const [loading, setLoading] = useState(true);
	const [friends, setFriends] = useState([]);
	const [inviteButton, setInviteButton] = useState("Invite");

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-friends`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setFriends(response.data.data.friends);
				setLoading(false);
			} else {
			}
		})();
	}, []);

	const inviteFriend = async (e: any, friendId: string) => {
		e.stopPropagation();
		try {
			setInviteButton("Inviting...");
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/user/invite`,
				{
					friendId: friendId,
					gameId: gameId,
				},
				{
					withCredentials: true,
				}
			);

			if (response) {
				setInviteButton("Invited");
                setOpenFriendList(false)
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 overflow-scroll z-50">
			<div className="bg-gray-800 p-4 rounded-lg shadow-lg w-3/5 md:w-4/5 max-h-96 text-white z-50">
				<div
					className="flex justify-end rounded-full text-gray-300"
				>
					<div
						className="rounded-full hover:bg-gray-50 hover:bg-opacity-10 p-2 transition-all cursor-pointer"
						onClick={() => setOpenFriendList(false)}
					>
						<IoMdClose size={25} />
					</div>
				</div>
				<div>
					{friends.length === 0 && (
						<p className="text-sm text-gray-100 min-h-full flex items-center justify-center">
							No friends.
						</p>
					)}
					{friends.length !== 0 &&
						friends.map((friend: any) => (
							<div key={friend.id}>
								<div className="flex items-center gap-5 border-b-2 border-gray-50 border-opacity-20 p-2">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold">
											{(
												friend.requester.id !== user?.id
													? friend.requester.avatarUrl
													: friend.receiver.avatarUrl
											) ? (
												<img
													src={
														friend.requester.id !==
														user?.id
															? friend.requester
																	.avatarUrl
															: friend.receiver
																	.avatarUrl
													}
													alt={
														friend.requester.id !==
														user?.id
															? friend.requester
																	.name
															: friend.receiver
																	.name
													}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : friend.requester.id !==
											  user?.id ? (
												friend.requester.name[0].toUpperCase()
											) : (
												friend.receiver.name[0].toUpperCase()
											)}
										</div>
										<span className="text-white font-medium">
											{friend.requester.id !== user?.id
												? friend.requester.name
												: friend.receiver.name}
										</span>
									</div>
									<div className="flex space-x-2 ml-auto">
										<button
											className="bg-blue-500 text-white text-md px-3 py-1 rounded hover:bg-blue-600"
											onClick={(e) =>
												inviteFriend(
													e,
													friend.requester.id !==
														user?.id
														? friend.requester.id
														: friend.receiver.id
												)
											}
										>
											{inviteButton}
										</button>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export default FriendListModal;
