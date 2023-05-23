import axios from 'axios'
import authApi from './authApi.js'

export default async (body) => {
	return await axios.post(process.env.API_URL + 'warehouse/products/update/646b3a7037419e62d39f3ff4', body, {
		headers: { Authorization: 'Bearer ' + globalThis.token }
	})
		.then(res => {
			return res
		})
		.catch(async err => {
			if (err.response.status === 401) {
				globalThis.token = await authApi()
				return await axios.post(process.env.API_URL + 'warehouse/products/update/646b3a7037419e62d39f3ff4', body, {
					headers: { Authorization: 'Bearer ' + globalThis.token }
				})
			} else throw Error('Не смог передать остатки.')
		})
}