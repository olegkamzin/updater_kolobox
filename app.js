import dotenv from 'dotenv'
import fs from 'fs'
import authApi from './service/api/authApi.js'
import authKolobox from './service/kolobox/authKolobox.js'
import tyresKolobox from './service/kolobox/tyresKolobox.js'
import productsApi from './service/api/productsApi.js'
import updateApi from './service/api/updateApi.js'
dotenv.config()

const timer = ms => new Promise(resolve => setTimeout(resolve, ms))

const products = new Map()
const checked = new Map()

const getProducts = async () => {
	await productsApi()
		.then(res => {
			res.forEach(el => products.set(el.stocks.vendor, el))
		})
		.catch(e => console.log(e))
}

const sendProducts = async (body) => {
	const send = []
	const edited = []

	for (const el of body) {
		const id = el.id.toString()
		const product = products.get(id)

		if (product) {
			if (Number(el.count_local) !== product.stocks.quantity || Number(el.price) !== product.stocks.price) {
				const result = {}

				result.id = product.product
				result.quantity = Number(el.count_local)
				result.price = Number(el.price)
				result.vendor = id

				product.stocks.quantity = Number(el.count_local)
				product.stocks.price = Number(el.price)
	
				send.push(result)
			}
			checked.set(id)
		}
	}

	if (send.length !== 0) {
		await updateApi(send)
			.then(res => {
			})
			.catch(async err => console.log(err))
	}

}

const checkUpdate = async () => {
	const send = []

	products.forEach(el => {
		if (!checked.has(el.stocks.vendor)) {
			if (el.stocks.quantity !== 0) {
				send.push({
					id: el.product,
					quantity: 0,
					price: el.stocks.price,
					vendor: el.stocks.vendor
				})
				el.stocks.quantity = 0
			}
		}
	})

	if (send.length !== 0) await updateApi(send).catch(err => console.log(err))
}

const updateProducts = async () => {
	let page = 0

	while (true) {
		await tyresKolobox(page)
			.then(async res => {
				if (res.data.length === 0) {
					console.log('Новый круг')
					await checkUpdate()
					return page = 0
				}
				await sendProducts(res.data)
				page++
			})
			.catch(async err => {
				if (err.response?.status === 429) return null
				if (err.response?.status === 401) {
					globalThis.kolobox = await authKolobox().catch(async err => console.log(err))
						.catch(err => console.log(err))
				}
				console.log(err)
				await timer(60000)
			})
		await timer(1000)
	}
}

const start = async () => {
	try {
		globalThis.token = await authApi()
		globalThis.kolobox = await authKolobox()
	
		await getProducts()
		await updateProducts()
		console.log('Обновление запущено')
	} catch (e) {
		console.log(e)
	}
}

start()