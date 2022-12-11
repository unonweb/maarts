import { LitElement, html, render, css } from "lit"

// server side a hash will be calculated using price and id
// this hash will be checked before confirming the shopping cart 

const exCartContent = [
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

export default class UnShopCart extends LitElement {
    static properties = {
		cartContent: { type: Array, attribute: false },
		imgDir: { type: String, attribute: false },
	}

    constructor() {
        super()
		
		/* observed */
		
		/* init public */
		//this.cartContent = exCartContent
    }

	render() {
		return html`
			<link rel="stylesheet" href='/components/un-shop-cart--core.css'>
			<link rel="stylesheet" href='/components/un-shop-cart--add.css'>

			<div class="cart-table">
				<div class="row">
					<div class="td th col-one">&nbsp;</div>
					<div class="td th col-two">&nbsp;</div>
					<div class="td th col-three">Produkt</div>
					<div class="td th col-four">Anzahl</div>
					<div class="td th col-five">Zwischensumme</div>
				</div>
				${this.cartContent.map(product => this.tempTableBody(product))}
			</div>
			${this.tempCartTotals()}
		`		
	}

	// template methods

	tempTableBody(product) {
		let thumbnailFilename = product.images[0].image.sizes.thumbnail.filename
		let thumbnailPath = `${this.imgDir}${thumbnailFilename}`
		let productUrl = `${window.location.origin}/product?id=${product.id}`

		let renderRemove = html`
			<!-- remove -->
			<div class="td tb col-one">
				<input 
					type="button" 
					value="×"
					@click=${evt => this._removeProductCompletely(product)}>
			</div>
		`
		let renderThumbnail = html`
			<!-- thumbnail -->
			<div class="td tb col-two">
				<a href=${product.url}>
					<img
						src=${thumbnailPath}
						class="thumbnail"
						width="70"
						height="90"/>
				</a>
			</div>
		`

		let renderPriceVariation = html `
		<!-- name & price & variation -->
			<div class="td tb col-three">
				<a class="url" href=${productUrl}>${product.name}</a>
				<div class="price">${product.price}€</div>
				<div class="variation">
					<span class="variation-key">${product.variation.key}:</span>
					<span class="variation-value">${product.variation.value}</span>
				</div>
			</div>
		`

		let renderQty = html `
			<!-- quantity -->
			<div class="td tb col-four">
				<label for="qty ${product.id}"></label>
				<input 
					class="plusminus"	
					type="button" 
					value="–"
					@click=${evt => this._decQuantity(product)}>
				<input
					type="number"
					class="counter"
					id="qty ${product.id}"
					step="1"
					min="0"
					max=""
					name="qty ${product.id}"
					value=${product.quantity}
					title="Menge"
					size="4"
					inputmode="numeric"
					autocomplete="off"
					@change=${evt => this._changeQuantity(evt, product)}>
				<input 
					type="button" 
					value="+" 
					class="plusminus"
					@click=${evt => this._incQuantity(product)}>
			</div>
		`
		let renderSubtotal = html `
			<!-- subtotal -->
			<div class="td tb col-five">
				<div class="price">${this._calcSubtotal(product)}€</div>
			</div>
		`
		return html`
			<div class="row">
				${renderRemove}
				${renderThumbnail}
				${renderQty}
				${renderSubtotal}
			</div>
		`
	}

	tempCartTotals() {
		return html`
			<div class="cart-totals">
				<h2>Warenkorb-Summe</h2>
				<div class="subtotal">
					<span class="key">Zwischensumme</span>
					<span class="value">${this._calcCartTotal()} €</span>
				</div>
				<div class="total">
					<span class="key">Gesamtsumme</span>
					<span class="value">${this._calcCartTotal()} €</span>
				</div>
			</div>
		`
	}

	// private methods

	_checkProduct(product) {
		if (!product.id) throw Error('missing product.id')
		if (!product.name) throw Error('missing product.name')
		if (!product.price) throw Error('missing product.price')
		if (!product.quantity) throw Error('missing product.quantity')
		if (!product.url) throw Error('missing product.url')
		if (!product.img) throw Error('missing product.img')
		if (!product.variation) throw Error('missing product.variation')
		if (!product.hash) throw Error('missing product.hash')
	}

	_removeProductCompletely(updatedProduct) {
		this.cartContent = this.cartContent.filter(prod => prod.id !== updatedProduct.id)
		//this._updateCartContent(updatedProduct.id)
	}

	_updateCartContent(id) {
		this.requestUpdate()
		console.dir('updated cartContent with: ', this.cartContent.find(prod => prod.id === id))
	}

	_incQuantity(updatedProduct) {
		updatedProduct.quantity++
		this._updateCartContent(updatedProduct.id)
	}

	_decQuantity(updatedProduct) {
		updatedProduct.quantity--
		this._updateCartContent(updatedProduct.id)
	}
	_changeQuantity(evt, updatedProduct) {
		updatedProduct.quantity = Number(evt.target.value)
		this._updateCartContent(updatedProduct.id)
	}

	_calcSubtotal(product) {
		return product.price * product.quantity
	}

	_calcCartTotal() {
		let cartTotal = this.cartContent.reduce((sum, product) => {
			let subtotal = product.price * product.quantity
			return sum + subtotal
		   }, 0)
		return cartTotal
	}

	// public methods

	addProduct(product) {
		//this._checkProduct(product)
		this.cartContent.push(product)
		console.table('product placed into cartContent: ', product)
	}
    
}

customElements.define('un-shop-cart', UnShopCart)