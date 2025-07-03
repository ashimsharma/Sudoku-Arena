import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
	Login,
	Home,
	Leaderboard,
	Game,
	GameRoom,
	GameBoardScreen,
	Profile,
	UserGames,
	GameInfo,
	UserProfile,
	FriendRequests,
	Friends
} from "./components";
import AuthComponent from "./components/AuthComponent";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
	return (
		<>
			<Provider store={store}>
			<Router>
					<Routes>
						<Route
							path="/login"
							element={
								<AuthComponent
									show={false}
									children={<Login />}
								/>
							}
						/>
						<Route
							path="/"
							element={
								<AuthComponent
									show={true}
									children={<Home />}
								/>
							}
						/>
						<Route
							path="/leaderboard"
							element={
								<AuthComponent
									show={true}
									children={<Leaderboard />}
								/>
							}
						/>
						<Route path="/game" element={<Game />} />
						<Route path="/game/game-room" element={<GameRoom />} />
						<Route path="/game/game-room/game-board" element={<GameBoardScreen />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/profile/all-games" element={<UserGames />} />
						<Route path="/profile/friends" element={<Friends />} />
						<Route path="/profile/all-games/game" element={<GameInfo />} />
						<Route path="/user/profile" element={<UserProfile />} />
						<Route path="/friend-requests" element={<FriendRequests />} />
					</Routes>
			</Router>
			</Provider>
		</>
	);
}

export default App;
