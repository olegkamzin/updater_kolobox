import dotenv from 'dotenv'
import authApi from './service/api/authApi.js'
import authKolobox from './service/kolobox/authKolobox.js'
import productsKolobox from './service/kolobox/productsKolobox.js'
import productsApi from './service/api/productsApi.js'
import updateApi from './service/api/updateApi.js'
dotenv.config()

const timer = ms => new Promise(resolve => setTimeout(resolve, ms))
let products
let category = 'tyres'
const items = []
const send = []
const test123 = []


const sendProducts = async (body) => {
	items.length = 0
	for (const el of body) {
		const id = el.id.toString()
		const product = products.get(id)

		if (products.has(id)) {
			console.log('+')
			product.checked = true
			test123.push(product)
			if (Number(el.count_local) !== product.stocks.quantity || Number(el.price) !== product.stocks.price) {
				const result = {}
	
				result.id = product.product
				result.quantity = Number(el.count_local)
				result.price = Number(el.price)
				result.vendor = id

				items.push(result)
			}
		} else {
			if (el.count_local >= 4) {
				// выводим товары которых нет в каталоге
				// console.log(el)
			}
		}
	}

	// if (items.length !== 0) {
	// 	await updateApi(items)
	// 		.then(() => {
	// 			items.forEach(el => {
	// 				const prod = products.get(el.vendor)
	// 				prod.price = el.price
	// 				prod.quantity = el.quantity
	// 			})
	// 		})
	// 		.catch(async err => console.log(err))
	// }

}

const checkUpdate = async () => {
	// console.log(products)
	const test333 = []

	products.forEach(el => {
		if (!el.checked) {
			send.push({
				id: el.product,
				quantity: 0,
				price: el.stocks.price,
				vendor: el.stocks.vendor
			})
			el.stocks.quantity = 0
		} else {
			test333.push({
				id: el.product,
				quantity: 0,
				price: el.stocks.price,
				vendor: el.stocks.vendor
			})
		}
		el.checked = false
	})

	console.log(send)
	console.log(test333)
	// send.length = 0

	// if (send.length !== 0) await updateApi(send).catch(err => console.log(err))

	function findIntersection(array1, array2) {
		const intersection = [];
		for (let i = 0; i < array1.length; i++) {
		  if (array2.includes(array1[i])) {
			intersection.push(array1[i]);
		  }
		}
		return intersection;
	}
	console.log(findIntersection(send, test123))
}

const updateProducts = async () => {
	let page = 0

	const fetchProducts = async () => {
		await productsKolobox(page, category)
			.then(async res => {
				if (res.data.length !== 0) {
					await sendProducts(res.data)
					page++
				} else {
					if (category === 'rims') await checkUpdate()
					category = category === 'tyres' ? 'rims' : 'tyres'
					console.log(category)
					return page = 0
				}
			})
			.catch(async e => {
				if (e.response?.status === 429) return await timer(60000)
				if (e.response?.status === 401) {
					return globalThis.kolobox = await authKolobox()
						.catch(err => console.log(err))
				}
				console.log(e)
			})
	}

	setInterval(fetchProducts, 1000)
}

const start = async () => {
	try {
		globalThis.token = await authApi()
		globalThis.kolobox = await authKolobox()
		products = await productsApi()
		await updateProducts()
	} catch (e) {
		console.log(e)
	}
  }

start()