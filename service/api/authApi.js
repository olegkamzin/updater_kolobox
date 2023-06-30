import axios from 'axios'

export default async () => {
	return (await axios.post(process.env.API_URL + 'auth/access/token', null, {
		headers: {
			Token: process.env.API_TOKEN
		},
		params: {
			token_id: process.env.API_TOKEN_ID
		}
	})).data.access_token
}