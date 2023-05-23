import axios from 'axios'

export default async (page) => {
	return axios.get(process.env.KOLOBOX_URL + 'catalog/tyres/' + page + '/?sort=by_stock', {
		headers: { Authorization: 'Bearer ' + globalThis.kolobox }
	})
}