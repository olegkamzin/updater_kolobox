import axios from 'axios'

export default async () => {
	const products = new Map()
	
	await axios.get(process.env.API_URL + 'warehouse/products/?storage=646b3a7037419e62d39f3ff4', {
		headers: { Authorization: 'Bearer ' + globalThis.token }
	})
		.then(res => res.data.forEach(el => {
			products.set(el.stocks.vendor, { ...el, checked: false })
		}))
	
	return products
}