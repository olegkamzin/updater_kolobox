import axios from 'axios'

export default async () => {
	const params = new URLSearchParams()
	params.append('grant_type', 'password')
	params.append('client_id', process.env.CLIENT_ID)
	params.append('client_secret', process.env.CLIENT_SECRET)
	params.append('username', process.env.USERNAME)
	params.append('password', process.env.PASSWORD)
	return (await axios.post(process.env.KOLOBOX_URL + 'oauth/token', params)).data.access_token
}
