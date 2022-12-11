/* IMPORT EXTERNAL DEPS */
import { LitElement, html } from "lit"
import { until } from 'lit/directives/until.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

/* IMPORT COMPONENTS */
import UnDropDown from './components/un-drop-down.js'
import UnGallery from './components/un-gallery.js'
import UnMenuBar from './components/un-menu-bar.js'
import UnHeader from './components/un-header.js'
import UnShopCart from './components/un-shop-cart.js'
import UnShop from './components/un-shop.js'

/* IMPORT DATA */
import headerData from './assets/data/header.js'
import homePageData from './assets/data/home.js'

export class UnApp extends LitElement {
    static properties = {
		// public
		theme: { type: String, attribute: true, reflect: true },
		// private
		_routes: { type: Array, attribute: false },
		_location: { type: String, attribute: false },
		_lang: { type: String, attribute: false },
		//_loading: { type: Boolean, attribute: false },
		//_data: { type: Object, attribute: false }

	}

    constructor() {
        super()
		
		/* observed */

		/* init public observed properties */
		this.theme = 'maarts'
		this.host = 'localhost'
		/* init private properties */
		this._lang = this._getBrowserLang() || 'en'
		
		/* not observed */

		/* init private properties */
		this._loading = false
		this._homepage = '/home'
		this._cartContent = []

		this._data = {
			products: {
				urlDisk: '/assets/data/shop-products.json',
				complete: false,
			},
			categories: {
				urlDisk: '/assets/data/shop-categories.json',
				complete: false,
			},
		}

		this._routes = {
			404: {
				template: this.renderPageNotFound.bind(this),
				title: "404",
				description: "Page not found",
				menu: {
					show: false,
				},
			},
			'/home': {
				template: this.renderPageHome.bind(this),
				menu: {
					show: true,
					title: { en: 'Home', de: 'Home' }
				},
			},
			'/shop': {
				template: this.renderPageShop.bind(this),
				menu: {
					show: true,
					title: { en: 'Shop', de: 'Shop' }
				},
			},
			'/sale': {
				template: this.renderPageSale.bind(this),
				menu: {
					show: true,
					title: { en: 'Sale', de: 'Sale' }
				},
			},
			'/manufacture': {
				template: this.renderPagePreparations.bind(this),
				menu: {
					show: true,
					title: { en: 'Custom-made', de: 'Anfertigungen' }
				},
			},
			'/lookbook': {
				template: this.renderPageLookbook.bind(this),
				menu: {
					show: true,
					title: { en: 'Lookbook', de: 'Lookbook' }
				},
			},
			'/about': {
				template: this.renderPageAbout.bind(this),
				menu: {
					show: true,
					title: { en: 'About', de: 'About' }
				},
			},
			'/cart': {
				template: this.renderPageCart.bind(this),
				menu: {
					show: true,
					title: { en: 'Shopping Cart', de: 'Warenkorb' }
				},
			},
			'/sizes': {
				template: this.renderPageSizes.bind(this),
				menu: {
					show: true,
					title: { en: 'Measuring', de: 'Größen berechnen' }
				},
			},
			'/agb': {
				template: this.renderPageAgb.bind(this),
				menu: {
					show: true,
					title: { en: 'AGBs', de: 'AGBs' }
				},
			},
			'/product': {
				template: this.renderProduct.bind(this),
				menu: {
					show: false,
				},
			},
		}

		// paths
		this._paths = {
			assets: '/assets/',
			img: '/assets/img/'
		}

		// ADD EVENT LISTENERS

		this.addEventListener('product-selected', this)
		// create document click that watches the nav links only
		window.addEventListener("click", this)
		// add an event listener to the window that watches for url changes
		window.addEventListener('popstate', this)
		
		// FUNCTION CALLS

		this._updateLocation()
    }

	createRenderRoot() {
		return this
	}

	willUpdate(changedProperties) {
		console.log('willUpdate(): ', changedProperties)
	}

	render() {

		let route = this._routes[this._location] || this._routes['404']
		console.log('render()')
		// set meta tags:
		document.querySelector('html').setAttribute('lang', this._lang)
		
		return html`
		<header>
			${this.renderHeader(headerData)}
		</header>
		<nav>
			${this.renderMenuBar(this._routes)}
		</nav>
		<main page=${ifDefined(this._location)}>
			${until(route.template(route), this._renderLoading())}
		</main>
		`
	}

	renderHeader(headerData) {

		let page = headerData[this._lang]
		let paths = this._paths
		
		return html`
			<un-header>
				${page.images.map(img => this._renderImgSrcSetFromPayload(img, paths.img))}
			</un-header>
		`
	}

	renderMenuBar(routes) {
		return html`
			<un-menu-bar theme=${this.theme}>
				${Object.entries(routes).map(([key, value]) => {
					// loops through routes obj providing key: value pairs
					let route = key
					let data = value
					// create entries for menu-bar
					if (!data.menu.show) return '' // no entry if not desired
					return html`
						<a slot="left" href=${route}>${data.menu.title[this._lang]}</a>
					`
				})}
			</un-menu-bar>
		`
	}

	renderPageHome(routes) {
		// requires homePageData

		let page = homePageData[this._lang]
		page.contentHtml = this._convertSlateRTtoHTML(page.contentRichText, this._paths.img)

		return html`
			<un-gallery arrows="false" bullets="true" thumbnails="0" slide="true" page=${ifDefined(this._location)}>
				${page.slideshowImages.map(img => this._renderImgSrcSetFromPayload(img, this._paths.img))}
			</un-gallery>
			<article>
				<h1>
					<a href="/shop">Onlineshop</a>
				</h1>
				<section class="rt-content">
					${unsafeHTML(page.contentHtml)}
				</section>
				<section class="social-media-links">
					${page.socialMediaImages.map(img => {
						return html`
							<a href=${img.href}>
								<img src="${this._paths.img}${img.image.filename}" alt=${img.image.name}>
							</a>
						`
					})}
				</section>
			</article>
		`
	}

	async renderPageShop(route) {

		let paths = this?._paths
		let location = this?._location
		let lang = this?._lang
		// this.data.products
		this._data.products.json = this._data.products.json ?? await this._fetchJson(this._data.products.urlDisk) // get the content
		// this.data.categories
		this._data.categories.json = this._data.categories.json ?? await this._fetchJson(this._data.categories.urlDisk) // get the content

		let data = {
			products: this._data.products.json[this._lang],
			categories: this._data.categories.json[this._lang],
		} // extract content
		
		this._setPageMetaData(data.page) // set page specific meta data

		return html`
			<h1>un-shop</h1>
			<un-shop 
				.products=${data.products.json}
				.categories=${data.categories.json}
				.imgDir=${paths.img}
				lang=${lang}
				page=${ifDefined(location)}
				ui="search-name, search-description, select-category, categories">
			</un-shop>
		`
	}

	renderPageSale() {
		return html``
	}

	renderPagePreparations() {
		return html``
	}

	renderPageLookbook() {
		return html``
	}

	renderPageAbout() {
		return html``
	}

	async renderPageCart(route) {
		return html`
			<un-shop-cart 
				.cartContent=${this._cartContent}
				.imgDir=${this._paths.img}>
			</un-shop-cart>
		`
	}

	renderPageSizes() {
		return html``
	}

	renderPageAgb() {
		return html``
	}

	async renderProduct(route) {
		// requires 
		// -- this._data.products
		// gets the id of the selected product via the query string

		if (route.dataComplete === false) {
			for (let i = 0; i < route.dataRequired.length; i++) {
				let dataReq = route.dataRequired[i]
				//console.log(dataReq)
				if (!dataReq.json) {
					dataReq.json = await this._fetchJson(dataReq.url)
					//console.log('fetched: ', dataReq)
				}
			}
			route.dataComplete = true
		}

		let productId = new URLSearchParams(document.location.search).get('id')
		//console.log(productId)
		let product = this._data.products.json[this._lang].docs.find(item => item.id === productId)
		product.contentHtml = this._convertSlateRTtoHTML(product.contentHtml, this._paths.img)
		//console.log(product)

		return html`
			<aside class="product__img">
				<un-gallery thumbnails="4" bullets="false" arrows="true" orientation="vertical" page=${ifDefined(this._location)}>
					${product.images.map(img => this._renderImgSrcSetFromPayload(img, this._paths.img))}
				</un-gallery>
			</aside>
			<article>
				<h1 class="product__title">${product.name}</h1>
				<p class="product__category">${product.category.name}</p>
				<div class="product__desc">${unsafeHTML(product.contentHtml)}</div>
				<div class="product__price">${product.price}</div>
				<button 
					class="add-to-cart"
					@click=${evt => this.addToCart(evt, product)}>
				</button>
			</article>
			
		`
	}

	renderPageNotFound() {
		return html`PAGE NOT FOUND: <b style="color: darkblue">${this._location}</b>`
	}

	_renderImgSrcSetFromPayload(payloadImgObj, imgDir) {
    
		let imgEl
		if (!payloadImgObj.sizes) payloadImgObj = payloadImgObj.image // try reassigning one lvl down 
		if (payloadImgObj.sizes) {
			// if there are different sizes...
			let imgSizes = payloadImgObj.sizes
	
			let img1920Str = (Object.keys(imgSizes.img1920).length !== 0) ? `${imgDir}${imgSizes.img1920.filename} 1920w, ` : ""
			let img1600Str = (Object.keys(imgSizes.img1600).length !== 0) ? `${imgDir}${imgSizes.img1600.filename} 1600w, ` : ""
			let img1366Str = (Object.keys(imgSizes.img1366).length !== 0) ? `${imgDir}${imgSizes.img1366.filename} 1366w, ` : ""
			let img1024Str = (Object.keys(imgSizes.img1024).length !== 0) ? `${imgDir}${imgSizes.img1024.filename} 1024w, ` : ""
			let img768Str = (Object.keys(imgSizes.img768).length !== 0) ? `${imgDir}${imgSizes.img768.filename} 768w, ` : ""
			let img640Str = (Object.keys(imgSizes.img640).length !== 0) ? `${imgDir}${imgSizes.img640.filename} 640w, ` : ""
			let imgOriginal = `${imgDir}${payloadImgObj.filename}`
	
			imgEl = html`
			<img
				srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}${imgOriginal}"
				sizes="
					(max-width: 640px) 640px, 
					(max-width: 768px) 768px, 
					(max-width: 1024px) 1024px,
					(max-width: 1366px) 1366px,
					(max-width: 1600px) 1600px,
					1920px"
				>
			`
		} else if (payloadImgObj.filename) {
			// if there is just one size...
			imgEl =  html`<img src="${imgDir}${payloadImgObj.filename}">`
		} else {
			throw ReferenceError(payloadImgObj, 'does not contain image properties')
		}
	
		return imgEl
	}

	_renderLoading() {
		return html`
			<span>Loading...</span>
		`
	}

	/* EVENT LISTENERS */

	handleEvent(evt) {
		if (evt.type === 'click') {
			let lowestEvtTarget = evt?.composedPath()[0]
			if (lowestEvtTarget.matches('a') && lowestEvtTarget.href.includes(this.host)) {
				// make any link in the <nav> tags use OUR routing
				console.log('[evt] internal anchor clicked: ', lowestEvtTarget)
				evt.preventDefault()
				window.history.pushState({}, "", lowestEvtTarget.href) // push the new location into the browser url bar and the history
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

	/* HELPER METHODS */

	addToCart(evt, product) {
		this._cartContent.push(product)
		console.table('product placed into cartContent: ', product)
	}

	_setPageMetaData(data) {
		// data.title
		// data.description
		document.title = data.title
		document.querySelector('meta[name="description"]').setAttribute("content", data.description)
	}

	_updateLocation() {
		// triggers render()
		if (window.location.pathname === '/' && this._homepage) {
			window.history.pushState({}, "", this._homepage) // push the new location into the browser url bar and the history
		}
		this._location = window.location.pathname // retrieve and save it (the URL slug after the origin)
		console.dir('updateLocation(): ', this._location)
	}

	_convertSlateRTtoHTML(rtContent, webImgDir) {
		// receives slate richtText content
		// returns a html string
	
		function _isText(value) {
			// copied from Slate
		
			function isPlainObject(o) {
				var ctor, prot;
			
				if (isObject(o) === false) return false;
			
				// If has modified constructor
				ctor = o.constructor;
				if (ctor === undefined) return true;
			
				// If has modified prototype
				prot = ctor.prototype;
				if (isObject(prot) === false) return false;
			
				// If constructor does not have an Object-specific method
				if (prot.hasOwnProperty('isPrototypeOf') === false) {
					return false;
				}
			
				// Most likely a plain Object
				return true;
			}
		
			function isObject(o) {
				return Object.prototype.toString.call(o) === '[object Object]';
			}
		
			return isPlainObject(value) && typeof value.text === 'string';
		}

		function _createImgSrcSetEl(payloadImgObj, imgDir) {
			// use this local variant instead of this._renderImgSrcSetFromPayload
			// because we need it to return plain html
    
			let imgEl
			if (!payloadImgObj.sizes) payloadImgObj = payloadImgObj.image // try reassigning one lvl down 
			if (payloadImgObj.sizes) {
				// if there are different sizes...
				let imgSizes = payloadImgObj.sizes
		
				let img1920Str = (Object.keys(imgSizes.img1920).length !== 0) ? `${imgDir}${imgSizes.img1920.filename} 1920w, ` : ""
				let img1600Str = (Object.keys(imgSizes.img1600).length !== 0) ? `${imgDir}${imgSizes.img1600.filename} 1600w, ` : ""
				let img1366Str = (Object.keys(imgSizes.img1366).length !== 0) ? `${imgDir}${imgSizes.img1366.filename} 1366w, ` : ""
				let img1024Str = (Object.keys(imgSizes.img1024).length !== 0) ? `${imgDir}${imgSizes.img1024.filename} 1024w, ` : ""
				let img768Str = (Object.keys(imgSizes.img768).length !== 0) ? `${imgDir}${imgSizes.img768.filename} 768w, ` : ""
				let img640Str = (Object.keys(imgSizes.img640).length !== 0) ? `${imgDir}${imgSizes.img640.filename} 640w, ` : ""
				let imgOriginal = `${imgDir}${payloadImgObj.filename}`
		
				imgEl = `
				<img
					srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}${imgOriginal}"
					sizes="
						(max-width: 640px) 640px, 
						(max-width: 768px) 768px, 
						(max-width: 1024px) 1024px,
						(max-width: 1366px) 1366px,
						(max-width: 1600px) 1600px,
						1920px"
					>
				`
			} else if (payloadImgObj.filename) {
				// if there is just one size...
				imgEl = `<img src="${imgDir}${payloadImgObj.filename}">`
			} else {
				throw ReferenceError(payloadImgObj, 'does not contain image properties')
			}
		
			return imgEl
		}
	
		// main
		if (Array.isArray(rtContent)) {
			// [children]...
			return rtContent.reduce((output, node) => {
				// returns a single value which is calculated based on the array
				const isTextNode = _isText(node)
				//const isTextNode = (node.type) ? false : true
	
				const {
					text,
					bold,
					code,
					italic,
					underline,
					strikethrough,
				} = node // erstellt sechs Variablen mit dem Inhalt von node.text, node.bold,...
	
				if (isTextNode) {
					// convert straight single quotations to curly
					// "\u201C" is starting double curly
					// "\u201D" is ending double curly
					let html = text?.replace(/'/g, '\u2019'); // single quotes
	
					if (bold) {
						html = `<strong>${html}</strong>`;
					}
	
					if (code) {
						html = `<code>${html}</code>`;
					}
	
					if (italic) {
						html = `<em>${html}</em>`;
					}
	
					if (underline) {
						html = `<span style="text-decoration: underline;">${html}</span>`;
					}
	
					if (strikethrough) {
						html = `<span style="text-decoration: line-through;">${html}</span>`;
					}
	
					//console.log('adding html: ', html)
					return `${output}${html}`;
				}
	
				if (node) {
					let nodeHTML
					// check node.type
					switch (node.type) {
						case 'h1':
							nodeHTML = `<h1>${this._convertSlateRTtoHTML(node.children)}</h1>`;
							break;
	
						case 'h2':
							nodeHTML = `<h2>${this._convertSlateRTtoHTML(node.children)}</h2>`;
							break;
	
						case 'h3':
							nodeHTML = `<h3>${this._convertSlateRTtoHTML(node.children)}</h3>`;
							break;
	
						case 'h4':
							nodeHTML = `<h4>${this._convertSlateRTtoHTML(node.children)}</h4>`;
							break;
	
						case 'h5':
							nodeHTML = `<h5>${this._convertSlateRTtoHTML(node.children)}</h5>`;
							break;
	
						case 'h6':
							nodeHTML = `<h6>${this._convertSlateRTtoHTML(node.children)}</h6>`;
							break;
	
						case 'ul':
							nodeHTML = `<ul>${this._convertSlateRTtoHTML(node.children)}</ul>`;
							break;
	
						case 'ol':
							nodeHTML = `<ol>${this._convertSlateRTtoHTML(node.children)}</ol>`;
							break;
	
						case 'li':
							nodeHTML = `<li>${this._convertSlateRTtoHTML(node.children)}</li>`;
							break;
	
						case 'link':
							nodeHTML = `<a href="${node.url}">${this._convertSlateRTtoHTML(node.children)}</a>`;
							break;
	
						case 'relationship':
							nodeHTML = `<strong>Relationship to ${node.relationTo}: ${node.value}</strong><br/>`;
							break;
	
						/* IMAGE */
	
						case 'upload':
							nodeHTML = _createImgSrcSetEl(node.value, webImgDir)
							break;
	
						case 'p':
						case undefined:
							nodeHTML = `<p>${this._convertSlateRTtoHTML(node.children)}</p>`;
							break;
	
						default:
							nodeHTML = `<strong>${node.type}</strong>:<br/>${JSON.stringify(node)}`;
							break;
					}
	
					//console.log('adding html: ', nodeHTML)
					return `${output}${nodeHTML}\n`
				}
	
				return output
				// end of content.reduce()
			}, '')
		}
		return ''
	}

	async _fetchJson(url) {
		// returns json
		try {
			this._loading = true
			let res = await fetch(url)
			let json = await res.json()
			console.log('_fetchJson(): ', url)
			console.log(json)
			this._loading = false
			return json		
		} catch (err) {
			console.error('_fetchJson(): failed to fetch ', url)
		}
	}
}

customElements.define('un-app', UnApp)