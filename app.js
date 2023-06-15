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

const sendProducts = async (body) => {
	for (const el of body) {
		const id = el.id.toString()
		const product = products.get(id)
		if (product && !product.checked) {
			if (Number(el.count_local) !== product.stocks.quantity || Number(el.price) !== product.stocks.price) {
				items.push({
					id: product.product,
					quantity: Number(el.count_local),
					price: Number(el.price),
					vendor: id
				})
				product.stocks.quantity = Number(el.count_local)
				product.stocks.price = Number(el.price)
			}
			product.time = new Date()
			product.checked = true
		} else {
			if (el.count_local >= 4) {
				// выводим товары которых нет в каталоге
				// console.log(el)
			}
		}
	}

	if (items.length !== 0) {
		await updateApi(items)
			.then(() => {
				items.forEach(el => {
					const prod = products.get(el.vendor)
					prod.price = el.price
					prod.quantity = el.quantity
				})
			})
			.catch(async err => console.log(err))
		
		items.length = 0
	}
}

const checkUpdate = async () => {
	const send = []
	const currentTime = new Date()

	for (const [key, value] of products) {
		if (!value.checked && value.stocks.quantity !== 0 && (currentTime - value.time) / (1000 * 60) > 10) {
			send.push({
				id: value.product,
				quantity: 0,
				price: value.stocks.price,
				vendor: key
			})
			value.stocks.quantity = 0
		}
		value.checked = false
	}

	// console.log(send)

	if (send.length !== 0) await updateApi(send)
		.catch(err => console.log(err))
}

const updateProducts = async () => {
	let page = 0

	while (true) {
		try {
			const res = await productsKolobox(page, category)
			if (res.length !== 0) {
				await sendProducts(res)
				page++
			} else {
				if (category === 'rims') {
					await checkUpdate()
				}
				category = category === 'tyres' ? 'rims' : 'tyres'
				page = 0
			}
			await timer(800)
		} catch (error) {
			if (error?.response?.status === 401) {
				globalThis.kolobox = await authKolobox()
				await timer(1000)
			} else {
				console.log(error)
				await timer(60000)
			}
		}
	}
}

const start = async () => {
	try {
		globalThis.token = await authApi()
		globalThis.kolobox = await authKolobox()
		products = await productsApi()
		console.log('Обновление запущено | ' + new Date())
		await updateProducts()
	} catch (e) {
		console.log(e)
	}
  }

start()