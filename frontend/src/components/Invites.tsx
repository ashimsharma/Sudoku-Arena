import axios from "axios";
import { useEffect, useState } from "react";

const Invites = () => {
	const [invites, setInvites] = useState<any>([]);
	const [invitesChanged, setInvitesChanged] = useState();
	const [acceptButton, setAcceptButton] = useState("Accept");
	const [rejectButton, setRejectButton] = useState("Reject");

	useEffect(() => {
		(async () => {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/user/get-invites`,
				{
					withCredentials: true,
				}
			);

			if (response) {
				setInvites(response.data.data.invites);
			}
		})();
	}, [invitesChanged]);

	return (
		<div>
			{invites.length === 0 && (
				<p className="text-sm text-gray-100 flex items-center justify-center">
					Nothing to show here for now.
				</p>
			)}
            {invites.length !== 0 && <h2 className="text-center text-xl p-2">Game Invites</h2>}
			{invites.length !== 0 &&
				invites.map((request: any) => (
					<div
						key={request.id}
						className="flex items-center justify-between bg-gray-700 p-3 rounded-lg max-w-lg mx-auto hover:bg-gray-700 gap-4"
					>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
								{request.inviter.avatarUrl ? (
									<img
										src={request.inviter.avatarUrl}
										alt={request.inviter.name}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									request.inviter.name[0].toUpperCase()
								)}
							</div>
							<span className="text-white font-medium hover:underline">
								{request.inviter.name}
							</span>
						</div>
						<div className="flex space-x-2">
							<button
								className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
								onClick={(e) => {}}
							>
								{acceptButton}
							</button>
							<button
								className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
								onClick={(e) => {}}
							>
								{rejectButton}
							</button>
						</div>
					</div>
				))}
		</div>
	);
};

export default Invites;
