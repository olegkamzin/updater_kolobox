import axios from 'axios'

export default async (page, category) => {
	return (await axios.get(process.env.KOLOBOX_URL + 'catalog/' + category + '/' + page + '/?onstock=only_available&sort=by_price_up', {
		headers: { Authorization: 'Bearer ' + globalThis.kolobox }
	})).data
}