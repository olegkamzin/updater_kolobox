import axios from 'axios'

export default async (page) => {
	return axios.get(process.env.API_URL + 'catalog/products', {
		params: {
			limit: 500,
			page,
			category: 'tyres'
		}
	})
}