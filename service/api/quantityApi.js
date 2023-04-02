import axios from 'axios'

export default async (quantities) => {
    return axios.post(process.env.API_URL + 'catalog/quantities', {
        quantities: quantities
    },
    {
		headers: { Authorization: 'Bearer ' + globalThis.apiToken }
	})
}