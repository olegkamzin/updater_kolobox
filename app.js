import dotenv from 'dotenv'
import axios from 'axios'
import fs from 'fs'
import authApi from './service/api/authApi.js'
import authKolobox from './service/kolobox/authKolobox.js'
import tyresKolobox from './service/kolobox/tyresKolobox.js'
import productsApi from './service/api/productsApi.js'
import quantityApi from './service/api/quantityApi.js'
dotenv.config()

const timer = ms => new Promise(resolve => setTimeout(resolve, ms))

const products = new Map()

const tyresUpdater = async () => {
	let page = 0
	console.log('Обновление запущено')
	await authKolobox()
		.then(res => globalThis.koloboxToken = res.data.access_token)
		.catch(err => {
			console.log(err)
			fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
		})
	await authApi()
		.then(res => globalThis.apiToken = res.data.accessToken)
		.catch(err => {
			console.log(err)
			fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
		})
	
	while (true) {
		await tyresKolobox(page)
			.then(async res => {
				if (res.data.length === 0) {
					checkQuantity()
					return page = 0
				}
				await searchProductQuantity(res.data)
				page++
			})
			.catch(async err => {
				if (err.response?.status === 429) return null
				if (err.response?.status === 401) {
					await authKolobox()
						.then(res => globalThis.koloboxToken = res.data.access_token)
						.catch(err => {
							console.log(err)
							fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
						})
				}
				fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
				await timer(60000)
			})
		await timer(1000)
	}
}

const searchProductQuantity = async (res) => {
	const quantities = []
	const result = []
	for (const el of res) {
		const { id, count_local } = el
		if (products.has(id)) {
			const productOne = products.get(id)
			if (productOne.quantity !== count_local) {
				quantities.push({ id: productOne.product, quantity: Number(count_local) })
				result.push({ id: id, product: productOne.product, quantity: Number(count_local) })
			}
			products.set(id, { product: productOne.product, quantity: Number(count_local), checked: true })
		}
	}
	if (quantities.length !== 0) {
		await quantityApi(quantities)
			.then(() => {
				for (const el of result) {
					products.set(el.id, { product: el.product, quantity: el.quantity, checked: true })
				}
			})
			.catch(async err => {
				if (err.response?.status === 401) {
					return await authApi()
						.then(res => globalThis.apiToken = res.data.accessToken)
						.catch(err => {
							console.log(err)
							fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
						})
				}
				console.log(err)
				fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
			})
	}
}

const getProducts = async () => {
	const apiMap = new Map()
	let productsPage = 1
	await (async function () {
		for (let page = 1; productsPage.length !== 0; page++) {
			await productsApi(page)
				.then(res => {
					productsPage = res.data
					for (const el of productsPage) {
						apiMap.set(el._id, el.quantity)
					}
				})
				.catch(err => console.log(err))
			await timer(100)
		}
	}())
	// console.log(apiMap)
	const koloboxId = async () => {
		const koloboxProducts = fs.readFileSync('kolobox.csv').toString().split('\r\n')
		for (const el of koloboxProducts) {
			if (!el) continue
			const product = el.split(',')
			products.set(Number(product[1]), { product: product[0], quantity: Number(apiMap.get(product[0]).quantity), checked: false })
		}
	}
	await koloboxId()
}

const checkQuantity = async () => {
	const quantities = []
	products.forEach((value, key, map) => {
		if (!products.get(key).checked) {
			if (products.get(key).quantity !== 0) quantities.push({ id: value.product, quantity: 0 })
			products.set(key, { product: value.product, quantity: 0, checked: false })
		}
	})
	await authApi()
		.then(res => globalThis.apiToken = res.data.accessToken)
		.catch(err => {
			console.log(err)
			fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
		})
	if (quantities.length !== 0) {
		if (quantities.length > 200) {
			const size_skus = 200
			for (let i = 0; i < Math.ceil(quantities.length / size_skus); i++) {
				await quantityApi(quantities.slice((i * size_skus), (i * size_skus) + size_skus))
					.catch(err => {
						console.log(err)
						fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
					})
			}
		} else {
			await quantityApi(quantities)
					.catch(err => {
						console.log(err)
						fs.appendFileSync('log.txt', `${new Date().toString()} ${err}\r\n===========================\r\n`)
					})
		}
	}
}
const start = async () => {
	await getProducts()
	await tyresUpdater()
}

start()