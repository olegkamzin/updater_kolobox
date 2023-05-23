import axios from 'axios'

export default async () => {
	return (await axios.post(process.env.API_URL + 'auth/token', null, {
		headers: {
			Token: process.env.API_TOKEN
		},
		params: {
			client_id: process.env.API_CLIENT_ID
		}
	})).data.accessToken
}