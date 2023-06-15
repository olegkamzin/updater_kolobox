import axios from 'axios'
import authApi from './authApi.js'

export default async (body) => {
	const chunkSize = 200

	for (let i = 0; i < body.length; i += chunkSize) {
		const chunk = body.slice(i, i + chunkSize)
		// console.log(chunk)
		await axios.post(process.env.API_URL + 'warehouse/products/update/646b3a7037419e62d39f3ff4', chunk, {
			headers: { Authorization: 'Bearer ' + globalThis.token }
		})
			.catch(async err => {
				if (err.response.status === 401) {
					globalThis.token = await authApi()
					return await axios.post(process.env.API_URL + 'warehouse/products/update/646b3a7037419e62d39f3ff4', chunk, {
						headers: { Authorization: 'Bearer ' + globalThis.token }
					})
				}
				console.log(err)
			})
	}
}