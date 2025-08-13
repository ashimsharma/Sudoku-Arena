import axios from "axios";

const checkAuth = async () => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_API_URL}/auth/check-auth`,
			{
				withCredentials: true,
			}
		);

		if (response) {
			return response;
		} else {
			const accessTokenRefreshed = await refreshAccessToken();
			if (accessTokenRefreshed) {
				const response: any = await checkAuth();
				return response;
			} else {
				false;
			}
		}
	} catch (error) {
		const accessTokenRefreshed = await refreshAccessToken();
		if (accessTokenRefreshed) {
			const response: any = await checkAuth();
			return response;
		} else {
			false;
		}
	}
};

const refreshAccessToken = async () => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_API_URL}/auth/refresh-access-token`,
			{
				withCredentials: true,
			}
		);

		if (response) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
};

export default checkAuth;
