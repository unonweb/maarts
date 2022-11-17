/* IMPORT EXTERNAL DEPS */
import { LitElement, html } from "lit"
import { until } from 'lit/directives/until.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'

/* IMPORT COMPONENTS */
import UnDropDown from './components/un-drop-down.js'
import UnGallery from './components/un-gallery.js'
import UnMenuBar from './components/un-menu-bar.js'
import UnHeader from './components/un-header.js'
import UnShopCart from './components/un-shop-cart.js'
import UnTable from './components/un-table.js'
//import UnShowcase from './components/un-showcase.js'
import UnShop from './components/un-shop.js'

/* IMPORT DATA */
//import jsonProducts from './assets/json/shop-products.json' assert {type: 'json'};
//import jsonProducts from './assets/json/shop-products.js'
import headerImgs from './assets/data/header-image.js'
import home from './assets/data/home.js'

export class UnApp extends LitElement {
    static properties = {
		// public
		theme: { type: String, attribute: true, reflect: true },
		// private
		_imgs: { type: Array, attribute: false },
		_routes: { type: Array, attribute: false },
		_location: { type: String, attribute: false },
		_lang: { type: String, attribute: false },
		_loading: { type: Boolean, attribute: false },
		_data: { type: Object, attribute: false }

	}

    constructor() {
        super()
		// init public properties
		this.theme = 'maarts'
		// init private properties
		this._lang = this._getBrowserLang() || 'en'
		//this._location = '/un-shop'
		this._loading = false

		// data
		this._data = {}
		this._data.products = {
			url: '/assets/data/shop-products.json',
		}
		this._data.categories = {
			url: '/assets/data/shop-categories.json'
		}

		this._routes = {
			404: {
				template: this.renderPageNotFound.bind(this),
				title: "404",
				description: "Page not found",
				menu: false,
			},
			'/': {
				template: this.renderPageHome.bind(this),
				title: "maartsHome",
				description: "",
				menu: true
			},
			'/un-gallery': {
				template: this.renderPageUnGallery.bind(this),
				title: "unGallery",
				description: "",
				menu: true
			},
			'/un-shop-cart': {
				template: this.renderPageUnShopCart.bind(this),
				title: "unShopCart",
				description: "",
				menu: true
			},
			'/un-table': {
				template: this.renderPageUnTable.bind(this),
				title: "unTable",
				description: "",
				menu: true
			},
			'/un-shop': {
				template: this.renderPageUnShop.bind(this),
				title: "unShop",
				description: "",
				dataRequired: [this._data.products, this._data.categories],
				dataComplete: false,
				menu: true
			},
			'/product': {
				template: this.renderProduct.bind(this),
				title: "maartsProduct",
				description: "",
				dataRequired: [this._data.products],
				dataComplete: false,
				menu: false

			}
		}

		// paths
		this._paths = {}
		this._paths.assets = '/assets/'
		this._paths.img = '/assets/img/'

		// only for demonstration purpose:

		this._imgs = [
			{ original: '/assets/img/1dc1ece412f8a1230a063150dc997baf.jpg', img640: '/assets/img/1dc1ece412f8a1230a063150dc997baf-1-640x427.jpg', img1024: '/assets/img/1dc1ece412f8a1230a063150dc997baf-1-1024x683.jpg' },
			{ original: '/assets/img/3a4c56cb79add79ba477782f08b4b2d4.jpg'},
			{ original: '/assets/img/6b000fc5171d41ae20dd5197fba7b11a.jpg'},
			{ original: '/assets/img/26790776ea56a73c66fe2fc92be597e6.jpg'},
			{ original: '/assets/img/a9e68f346d3371e37d0ba8c51cf8c4ae.jpg'},
			{ original: '/assets/img/3a4c56cb79add79ba477782f08b4b2d4.jpg', img640: '/assets/img/3a4c56cb79add79ba477782f08b4b2d4-640x427.jpg'},
			{ original: '/assets/img/6b000fc5171d41ae20dd5197fba7b11a.jpg'},
			{ original: '/assets/img/21d684ce18b9d0fea8ba45f4232f7b5c.jpg'},
		]

		this.tableContent = [
			{
				id: 1,
				name: 'Fusskettchen mit Edelsteinen',
				price: 42,
				quantity: 2,
				variation: {
					key: 'Farbe',
					value: 'Grün'
				},
				url: '',
				img: {
					src: '',
					alt: ''
				},
				hash: 123,
			},
			{
				id: 2,
				name: 'Creole',
				price: 10,
				quantity: 1,
				variation: {
					key: 'Farbe',
					value: 'Schwarz'
				},
				url: '',
				img: {
					src: '',
					alt: ''
				},
				hash: 123,
			}
		]

		// ADD EVENT LISTENERS

		this.addEventListener('product-selected', this)
		// create document click that watches the nav links only
		window.addEventListener("click", this)
		// add an event listener to the window that watches for url changes
		window.addEventListener('popstate', this)
		
		// FUNCTION CALLS

		//this._updateLocation()
    }

	createRenderRoot() {
		return this
	}

	render() {

		let route = this._routes[this._location] || this._routes['404']

		document.title = route.title
		document.querySelector('meta[name="description"]').setAttribute("content", route.description)
		
		return html`
		<header>
			${this.renderHeader()}
		</header>
		<nav>
			${this.renderMenuBar()}
		</nav>
		<main>
			${until(route.template(route), this.renderLoading())}
		</main>
		`
	}

	renderHeader() {
		// requires 
		// --headerImgs
		
		let imgSrcs = []
		headerImgs[this._lang].images.forEach(img => {
			//imgSrcs.original = img.image.filename
			imgSrcs.push(this._extractKeysFromObj(img.image.sizes, ['img1920', 'img1366', 'img1024', 'img768', 'img640'], 'filename'))
		})

		return html`
			<un-header transfx='grey' transtime='5000'>
				${imgSrcs.map(img => this.renderImgSrcSet(img, this._paths.img))}
			</un-header>
		`
	}

	renderMenuBar() {
		return html`
			<un-menu-bar theme=${this.theme}>
				${Object.entries(this._routes).map(([key, value]) => {
					// create entries for menu-bar
					if (!value.menu) return '' // no entry if not desired
					return html`
						<a slot="left" href=${key}>${value.title}</a>
					`
				})}
				<!-- un-drop-down -->
				<un-drop-down title="components" slot="right" overlay="true" openon="click" theme=${this.theme}>
					<span slot="icon">&#9660;</span>
					${Object.entries(this._routes).map(([key, value]) => {
						// create entries for dropdown
						if (!value.menu) return '' // no entry if not desired
						return html`
							<a href=${key}>${value.title}</a>
						`
					})}
					<hr>
					<a href="/home">Home</a>
				</un-drop-down>
			</un-menu-bar>
		`
	}

	renderPageHome() {
		return html`
			${unsafeHTML(home[this._lang].contentHtml)}
		`
	}

	renderImgSrcSet(src = { original: '', img1920: '', img1366: '', img1024: '', img768: '', img640: ''}, imgDir) {
					
		let img1920Str = (src.img1920) ? `${imgDir}${src.img1920} 1920w, ` : ""
		let img1600Str = (src.img1600) ? `${imgDir}${src.img1600} 1600w, ` : ""
		let img1366Str = (src.img1366) ? `${imgDir}${src.img1366} 1366w, ` : ""
		let img1024Str = (src.img1024) ? `${imgDir}${src.img1024} 1024w, ` : ""
		let img768Str = (src.img768) ? `${imgDir}${src.img768} 768w, ` : ""
		let img640Str = (src.img640) ? `${imgDir}${src.img640} 640w, ` : ""

		return html`
			<img
				src=${imgDir}${src.original}
				srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}"
				sizes="
					(max-width: 640px) 640px, 
					(max-width: 768px) 768px, 
					(max-width: 1024px) 1024px,
					(max-width: 1366px) 1366px,
					(max-width: 1600px) 1600px,
					1920px"
				loading="lazy"
			>
		`
	}

	renderPageUnGallery(route) {
		let demoArr = new Array(20).fill(0) // creates an array with 20 zeros

		return html`
			<h1>un-gallery</h1>
			${demoArr.map(() => {
				return html`
					<un-gallery thumbnails="5" bullets="true" arrows="true" orientation="horizontal" page="/un-gallery">
						${this._imgs.map(src => this.renderImgSrcSet(src))}
					</un-gallery>
				`
			})}
		`
	}

	renderPageUnShopCart() {
		return html`
			<h1>un-shop-cart</h1>
			<un-shop-cart></un-shop-cart>
		`
	}

	renderPageUnTable() {
		return html`
			<h1>un-table</h1>
			<un-table .columns=${['name', 'price', 'quantity', 'hash']} .rows=${this.tableContent}></un-table>
		`
	}

	async renderPageUnShop(route) {
		// requires 
		// this.data.products
		// this.data.categories
		
		if (!route.dataComplete) {
			for (let i = 0; i < route.dataRequired.length; i++) {
				let dataReq = route.dataRequired[i]
				//console.log(dataReq)
				if (!dataReq.json) {
					dataReq.json = await this._fetchJson(dataReq.url)
					console.log('fetched: ', dataReq)
				}
			}
			route.dataComplete = true

			//this._data.products = await this._fetchJson(this._data.products.url)
			//this._data.categories = await this._fetchJson(this._data.categories.url)
			//route.dataComplete = true
			//console.log('data complete for ', route.title)
			//console.log(this.data.products)
			//console.log(this.data.categories)
		}

		return html`
			<h1>un-showcase</h1>
			<un-shop 
				.products=${this._data.products.json}
				.categories=${this._data.categories.json}
				.imgDir=${this._paths.img}
				lang=${this._lang}
				page=${ifDefined(this._location)}
				ui="search-name, search-description, select-category, categories">
			</un-shop>
		`
	}

	renderProduct() {
		// requires 
		// -- this._data.products

		let productId = new URLSearchParams(document.location.search).get('id')
		console.log(productId)
		let product = this._data.products[this._lang].docs.find(item => item.id === productId)
		console.log(product)

		let imgSrcs = []
		product.images.forEach(img => {
			//imgSrcs.original = img.image.filename
			imgSrcs.push(this._extractKeysFromObj(img.image.sizes, ['img1920', 'img1366', 'img1024', 'img768', 'img640'], 'filename'))
		})

		//console.log(imgSrcs)

		return html`
			<un-gallery thumbnails="5" bullets="true" arrows="true" orientation="horizontal" page="/un-gallery">
				${imgSrcs.map(img => this.renderImgSrcSet(img, this._paths.img))}
			</un-gallery>
		`
	}

	renderLoading() {
		return html`
			<span>Loading...</span>
		`
	}

	renderPageNotFound() {
		return html`PAGE NOT FOUND: <b style="color: darkblue">${this._location}</b>`
	}

	// EVENT LISTENERS

	handleEvent(evt) {
		if (evt.type === 'click') {
			if (evt?.composedPath()[0].matches('a')) {
				// make any link in the <nav> tags use OUR routing
				let anchorTarget = evt?.composedPath()[0]
				console.log('[evt] anchor clicked: ', anchorTarget)
				evt.preventDefault()
				window.history.pushState({}, "", anchorTarget.href) // push the new location into the browser url bar and the history
				//window.dispatchEvent(new Event('popstate'))
				this._updateLocation()
			}
	  	}
	  	else if (evt.type === 'popstate') {
			console.log('[evt] popstate')
			this._updateLocation()
		}
		/* else if (evt.type === 'product-selected') {
			console.log('[evt] product-selected: ', evt.detail)
			let queryStr = new URLSearchParams(document.location.search)
			console.log(queryStr)
		} */
	}

	_getBrowserLang() {
		let browserLang
		switch(navigator.language) {
			case 'en-us':
			case 'en-US':
			case 'en':
				browserLang = 'en'
				break
			case 'de':
				browserLang = 'de'
				break
			default:
				browserLang = 'de' // this is the default userLang value
		}
		console.log('_getBrowserLang(): ', browserLang)
		return browserLang
	}

	_updateLocation() {
		this._location = window.location.pathname // get it again (the URL slug after the origin)
		console.dir('updateLocation(): ', this._location)
	}

	async _fetchJson(url) {
		this._loading = true
		let res = await fetch(url)
		let json = await res.json()
		//console.log('fetchJson(): ', json)
		this._loading = false
		return json
	}

	_extractKeysFromObj(obj, searchKeys = [], subkey = '') {
		const newObj = {}
		  	Object.keys(obj).forEach(key => {
				if (searchKeys.includes(key)) {
					if (subkey) newObj[key] = obj[key][subkey]
			  		else newObj[key] = obj[key]
			 	}
			})
		return newObj
	} 
}

customElements.define('un-app', UnApp)