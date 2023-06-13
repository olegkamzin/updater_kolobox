import axios from 'axios'

export default async (page, category) => {
	return axios.get(process.env.KOLOBOX_URL + 'catalog/' + category + '/' + page + '/?onstock=only_available', {
		headers: { Authorization: 'Bearer ' + globalThis.kolobox }
	})
}