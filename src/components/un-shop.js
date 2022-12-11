import { LitElement, html, render, css} from "lit"
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { ifDefined } from 'lit/directives/if-defined.js';

export default class UnShop extends LitElement {
    static properties = {
		// properties
		products: { type: Object, attribute: false },
		categories: { type: Object, attribute: false },
		imgDir: { type: String, attribute: false },
		// interal
		_filters: { type: Object, attribute: false }, // array of objects of filters
		// public attributes
		lang: { type: String },
		page:  { type: String },
		ui: { type: String, attribute: true, reflect: true }, // 'search-name', 'search-description', 'select-category', 'categories'
	}

    constructor() {
        super()
		
		/* observed */
		/* init public properties */

		//this.ui = ['search-name', 'search-description', 'select-category']
		//console.log('this.ui: ', this.ui)

		/* init private properties */
		this._filters = {
			category: '',
			name: '',
			description: '',
		}
    }

	render() {
		console.log('render()')
		return html`
			<link rel="stylesheet" href="/components/un-shop.css">
			${this.renderCategories()}
			${this.renderSidebar()}
			${this.renderProducts()}
		`
	}

	renderSidebar() {
		// 'search-name'
		let searchByName
		if (this.ui.includes('search-name')) {
			searchByName = html `
				<label>Search by name:
					<input 
						type="search" 
						@change=${evt => this.updateFilters('name', evt.target.value)}
						id="sidebar__name">
				</label>
			`
		}
		// 'search-description'
		let searchByDescription
		if (this.ui.includes('search-description')) {
			searchByDescription = html `
				<!-- des -->
				<label>Search by description:
					<input 
						type="search" 
						@change=${evt => this.updateFilters('description', evt.target.value)}
						id="sidebar__desc">
				</label>
			`
		}
		// select-category
		let selectCategory
		if (this.ui.includes('select-category')) {
			let categories = this.categories[this.lang].docs
			selectCategory = html`
				<fieldset>
  					<legend>Filter by category: </legend>
					<div id="sidebar__categories">
						${categories.map(item => {
						// loop through categories
						return html`
							<label>
								<input 
									type="checkbox" 
									value=${item.id}
									id=${item.id}
									?checked=${this._filters.category === item.id}
									@change=${() => this.updateFilters('category', item.id)}>${item.name}
							</label>
						`
						})}	
					</div>
				</fieldset>
			`
		}
		// final sidebar
		if (searchByName || selectCategory || searchByDescription) {
			return html`
				<aside id="sidebar">
					${searchByName}
					${searchByDescription}
					${selectCategory}
				</aside>
			`
		}
	}

	renderCategories() {
		if (this.ui.includes('categories')) {
			let categories = this.categories[this.lang].docs
			return html`
				<div id="categories">
					${categories.map(cat => {
						// loop through categories
						return html`
							<button class="category" 
								@click=${evt => {
									this.shadowRoot.querySelectorAll('.category').forEach(el => {
										if (el.contains(evt.target)) {
											el.classList.toggle('category--selected')
										} else {
											el.classList.remove('category--selected')
										}
									})
									this.updateFilters('category', cat.id)
								}}>
								${this.renderImgSrcSet(cat.image, { class: 'category__img'})}
								<div
									class="category__name">${cat.name}
								</div>
							</button>
						`
					})}
				</div>
			`
		}
	}

	renderProducts() {
		let products = this.products[this.lang].docs // select language
		products = this._filterByCategory(this._filters.category, products)
		products = this._filterByDescription(this._filters.description, products)
		products = this._filterByName(this._filters.name, products)
		return html`
			<div id="products">
				${products.map(product => {
					// loop through products
					return html`
						<div class="product">
							<a
								class="product__img"
								href="${window.location.origin}/product?id=${product.id}">
								<un-gallery arrows="false" onhover="swap" transfx="blend" bullets=false thumbnails="0" page=${this.page}>
									${this.renderImgSrcSet(product.images[0].image)}
									${this.renderImgSrcSet(product.images[1].image)}
								</un-gallery>
							</a>
							<div class="product__info">
								<a
									class="product__name"
									href="${window.location.origin}/product?id=${product.id}">${product.name}
								</a>
								<button class="product__category">${product.category.name}</button>
								<div class="product__price">${product.price} €</div>
								${this.renderSearchMatch(product.match)}
							</div>
						</div>
					`
				})}
			</div>
		`
	}

	renderImgSrcSet(payloadImgObj, attributes = {}) {
        
		let imgFormats = payloadImgObj?.sizes ?? false // should be an array of img sizes
		if (!imgFormats) {
			console.error('[createImgEl] payloadImgObj?.sizes is false')
			return ""
		}
		// if there is an img...
		let img1920Str = (Object.keys(imgFormats.img1920).length !== 0) ? `${this.imgDir}${imgFormats.img1920.filename} 1920w, ` : ""
		let img1600Str = (Object.keys(imgFormats.img1600).length !== 0) ? `${this.imgDir}${imgFormats.img1600.filename} 1600w, ` : ""
		let img1366Str = (Object.keys(imgFormats.img1366).length !== 0) ? `${this.imgDir}${imgFormats.img1366.filename} 1366w, ` : ""
		let img1024Str = (Object.keys(imgFormats.img1024).length !== 0) ? `${this.imgDir}${imgFormats.img1024.filename} 1024w, ` : ""
		let img768Str = (Object.keys(imgFormats.img768).length !== 0) ? `${this.imgDir}${imgFormats.img768.filename} 768w, ` : ""
		let img640Str = (Object.keys(imgFormats.img640).length !== 0) ? `${this.imgDir}${imgFormats.img640.filename} 640w, ` : ""
		let imgOriginal = `${this.imgDir}${payloadImgObj.filename}`

		return html`
			<img
				srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}${imgOriginal}"
				sizes="
					(max-width: 640px) 640px, 
					(max-width: 768px) 768px, 
					(max-width: 1024px) 1024px,
					(max-width: 1366px) 1366px,
					(max-width: 1600px) 1600px,
					1920px"
				class=${ifDefined(attributes.class)}
				slot=${ifDefined(attributes.slot)}
			>`
	}

	renderSearchMatch(match) {
		if (!match) return ''
		return html`
			<h5>Beschreibung</h5>
			<div class="product-search-match">...${match}...</div>
		`
	}

	// EVENT LISTENERS

	/* selectProduct(product) {
		const event = new CustomEvent('product-selected', { 
			bubbles: true, 
			composed: true,
			detail: { product: product } 
		})
		//console.log('product selected: ', event)
		this.dispatchEvent(event)
	} */

	updateFilters(type = '', val = '') {
		if (this._filters[type] === val) {
			// if this value is already set - remove it
			this._filters[type] = ''
		} else {
			this._filters[type] = val
			//console.log(`updateFilters() ${this._filters[type]} = ${val}`)
		}
		this.requestUpdate()
	}

	_filterByCategory(catId, products) {
		if (!catId) return products
		return products.filter(prod => prod.category.id === catId)
	}

	_filterByDescription(searchStr, products) {
		if (!searchStr) return products
		return products.filter((prod, prodIndex) => {
			let matchIndex = prod.contentHtml.toLowerCase().search(searchStr.toLowerCase())
			if (matchIndex !== -1) {
				let match = prod.contentHtml.slice(matchIndex, matchIndex + 50)
				prod.match = match // add a match property to corresponding product
				return true
			}
		})
	}

	_filterByName(searchStr, products) {
		if (!searchStr) return products
		return products.filter(prod => prod.name.toLowerCase().includes(searchStr.toLowerCase()))
	}
    
}

customElements.define('un-shop', UnShop)