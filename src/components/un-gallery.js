import { LitElement, html, render } from "lit"

export default class UnGallery extends LitElement {
    static properties = {
		// internal properties
		slottedElements: { type: Array, attribute: false },
		thumbnailsCreated: { type: Boolean, attribute: false },
		
		page: { type: String, attribute: true },

		// public attributes
		onhover: { type: String, attribute: true }, // 'swap' jumps one image further and back
		slide: { type: String, attribute: true }, // 'true', 'false'
		slidetime: { type: Number, attribute: true },
		transfx: { type: String, attribute: true, reflect: true }, // 'flash', 'grey', 'blend'
		arrows: { type: String, attribute: true, reflect: true },
		bullets: { type: String, attribute: true, reflect: true },
		thumbnails: { type: Number, attribute: true, reflect: true },
		orientation: { type: String, attribute: true, reflect: true }, // 'horizontal', 'vertical'
		theme: { type: String, attribute: true, reflect: true },
	}

    constructor() {
        super()
		// init public
		this.arrows = true
		this.bullets = true
		this.thumbnails = 5
		this.orientation = 'horizontal'
		this.transfx = 'blend'
		this.slidetime = 5000
		// init internal
		this.selectedImgIndex = 0
		this.thumbnailsCreated = false
		this.bulletsCreated = false
		this._firstThumbIndexShown = 0
		this._lastThumbIndexShown = 5
    }

	get lastImgIndex() {
		return this.slottedElements.length - 1
	}
	
	set firstThumbIndexShown(newIndex) {
		let oldIndex = this.firstThumbIndexShown
		//console.log('setting firstThumbIndexShown to ', newIndex)
		
		//update class 'thumbnail-next-left' and 'thumbnail-next-right'
		this.thumbnailElements[oldIndex - 1]?.classList?.remove('thumbnail-next-left')
		this.thumbnailElements[newIndex - 1]?.classList?.add('thumbnail-next-left')

		this._firstThumbIndexShown = newIndex
	}

	get firstThumbIndexShown() {
		return this._firstThumbIndexShown
	}

	set lastThumbIndexShown(newIndex) {
		let oldIndex = this.lastThumbIndexShown
		//console.log('setting lastThumbIndexShown to ', newIndex)

		//update class 'thumbnail-next-left' and 'thumbnail-next-right'
		this.thumbnailElements[oldIndex + 1]?.classList?.remove('thumbnail-next-right')
		this.thumbnailElements[newIndex + 1]?.classList?.add('thumbnail-next-right')

		this._lastThumbIndexShown = newIndex
	}

	get lastThumbIndexShown() {
		return this._lastThumbIndexShown
	}

	render() {
		// is called when this.slottedElements changes
		console.log('render()')
		return html`
			<link rel="stylesheet" href='/components/un-gallery--core.css'>
			<!-- <link rel="stylesheet" href='/components/un-gallery--add.css'> -->
			<div class="showcase" class="showcase">
				${this._renderArrow('left')}
				<slot id="default-slot"></slot>
				${this._renderArrow('right')}
				${this._renderBullets()}
			</div>
			${this._renderThumbnails()}
		`
	}

	_renderBullets() {
		// bullets are created in the second call of render()
		if (!this.shadowRoot.host.hasAttribute('bullets')) return // only create bullets when attribute is present
		if (this.shadowRoot.host.getAttribute('bullets') === "0") return
		if (this.shadowRoot.host.getAttribute('bullets') === "false") return
		if (!this.slottedElements) return ""
		
		this.bulletsCreated = true
		// bullets are related to image index by their id
		return html`
			<div class="bullets">
				${this.slottedElements.map((item, index) => {
					let cls = ''
					cls = (index === this.selectedImgIndex) ? 'bullet-current' : '' // initially add current class to bullet that corresponds with showcasedImg
					return html`
						<div 
							class="bullet ${cls}"
							id="bullet-${index}"
							data-index=${index}
							@click=${evt => this.setImgIndex(Number(evt.target.dataset.index))}>
						</div>
					`
				})}
			</div>
		`
	}

	_renderThumbnails() {
		// are created in the second call of render()
		if (!this.shadowRoot.host.hasAttribute('thumbnails')) return
		if (this.shadowRoot.host.getAttribute('thumbnails') === "0") return
		if (this.shadowRoot.host.getAttribute('thumbnails') === "false") return
		if (!this.slottedElements) return ""

		// init from attribute
		this.lastThumbIndexShown = this.thumbnails - 1

		// are related to image index by their id		
		return html`
			<div id="thumbnails" class="thumbnails" class="thumbnails">
				${this.slottedElements.map((item, index) => {
					
					let cls = ''
					if (index === this.selectedImgIndex) {
						cls = 'thumbnail-current'
					}
					if (index < this.firstThumbIndexShown || index > this.lastThumbIndexShown) {
						cls = cls.concat(' ', 'thumbnail-hide') // hide all thumbnails after
					}

					return html`
						<img
							src=${item.src}
							srcset=${item.srcset}
							class="thumbnail"
							class="thumbnail ${cls}"
							id="thumbnail-${index}"
							data-index=${index}
							@click=${evt => this.setImgIndex(Number(evt.target.dataset.index))}>
					`
				})}
			</div>
		`
	}

	_renderArrow(dir) {
		if (!this.shadowRoot.host.hasAttribute('arrows')) return
		if (this.shadowRoot.host.getAttribute('arrows') === "0") return
		if (this.shadowRoot.host.getAttribute('arrows') === "false") return

		if (dir === 'left') {
			return html`
				<button 
					class="arrows left"
					@click=${() => this.setImgIndex(this.selectedImgIndex - 1)}>
					<svg viewBox="0 0 50 80" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
						<polyline points="45.63,75.8 0.375,38.087 45.63,0.375"/>
					</svg>
				</button>
			`
		}
		if (dir === 'right') {
			return html`
				<button 
					class="arrows right"
					@click=${() => this.setImgIndex(this.selectedImgIndex + 1)}>
					<svg viewBox="0 0 50 80" xml:space="preserve">
					<polyline points="0.375,0.375 45.63,38.087 0.375,75.8"/>
					</svg>
				</button>
			`
		}
	}

	firstUpdated() {
		let slots = this.shadowRoot.querySelector('#default-slot')
		this.slottedElements = slots.assignedElements({flatten: true})
		if (this.slottedElements.length === 0) console.error('this.slottedElements.length === 0')
		this.slottedElements[0].classList.add('show') // showcase first img
		
		// add attribute dependent EVENT LISTENERS:
		if (this.shadowRoot.host.getAttribute('onhover') === 'swap') {
			//console.log('adding event listener for hover=swap')
			let showcase = this.shadowRoot.querySelector('.showcase')
			showcase.addEventListener('mouseover', () => this.setImgIndex(this.selectedImgIndex + 1))
			showcase.addEventListener('mouseout', () => this.setImgIndex(this.selectedImgIndex - 1))
		}
		if (this.shadowRoot.host.getAttribute('slide') === 'true') {
			setInterval(this._slideImgIndex.bind(this), this.slidetime)
			console.log('setInterval for ')
		}
	}

	updated() {
		if (!this.thumbnailsCreated) {
			// assign thumbnails array
			this.thumbnailElements = Array.from(this.shadowRoot.querySelectorAll('#thumbnails img'))
			if (this.thumbnailElements.length > 0) {
				this.thumbnailsCreated = true
			}
		}
	}

	setImgIndex(newIndex) {
		let oldIndex = this.selectedImgIndex

		// checks
		if (newIndex > this.slottedElements.length - 1) return // return if beyond last item
		if (newIndex < 0) return // return if beyond first item
		
		this.slottedElements[oldIndex].classList.remove('show') // 
		this.slottedElements[newIndex].classList.add('show') // 

		// finally change the index
		if (typeof newIndex !== 'undefined') {
			this.selectedImgIndex = newIndex // update index
			//console.log('showcasedImgIndex changed to: ', this.showcasedImgIndex)
		}

		this._updateClasses(oldIndex, newIndex)
	}

	_updateClasses(oldIndex, newIndex) {
		// then update classes
		if (this.bulletsCreated) {
			this.shadowRoot.querySelector(`#bullet-${oldIndex}`).classList.remove('bullet-current')
			this.shadowRoot.querySelector(`#bullet-${newIndex}`).classList.add('bullet-current')
		}

		if (this.thumbnailsCreated) {
			this.shadowRoot.querySelector(`#thumbnail-${oldIndex}`).classList.remove('thumbnail-current')
			this.shadowRoot.querySelector(`#thumbnail-${newIndex}`).classList.add('thumbnail-current')

			let indexUpdated = this._updateThumbIndexShown(newIndex, 0, this.lastImgIndex, this.firstThumbIndexShown, this.lastThumbIndexShown)

			if (indexUpdated) {
				this.thumbnailElements.forEach((item, index) =>  {

					if (index >= this.firstThumbIndexShown && index <= this.lastThumbIndexShown) {
						// show these
						item.classList.remove('thumbnail-hide')
					} else {
						// hide them
						item.classList.add('thumbnail-hide')
					}
				})
			}
		}
	}

	_slideImgIndex() {
		// called by setInterval
		console.log('slideImgIndex()')
		let oldIndex = this.selectedImgIndex
		let newIndex

		// set slide direction
		if (oldIndex === this.slottedElements.length - 1) {
			this._slideReverse = true
		}
		if (oldIndex === 0) {
			this._slideReverse = false
		}
		
		if (this._slideReverse) {
			newIndex = oldIndex - 1
		} else {
			newIndex = oldIndex + 1
		}

		this.slottedElements[oldIndex].classList.remove('show') // 
		this.slottedElements[newIndex].classList.add('show') // 

		// finally change the index
		this.selectedImgIndex = newIndex // update index
		// update classes
		this._updateClasses(oldIndex, newIndex)
	}

	_updateThumbIndexShown(pointer = 0, borderL = 0, borderR, indexL, indexR) {
		
		/* if pointer is within borders */
		if (pointer < indexR && pointer > indexL) return false
		if (pointer === indexR && pointer === borderR) return false
		if (pointer === indexL && pointer === borderL) return false
		/* if pointer is on first or last visible thumbnail */

		if (pointer === indexR) {
			// if last thumbnail is current and there're still imgs to the right
			this.firstThumbIndexShown++
			this.lastThumbIndexShown++
		}
		if (pointer === indexL) {
			this.firstThumbIndexShown--
			this.lastThumbIndexShown--
		}

		/* if pointer is beyond left or right borders */

		if (pointer > indexR) {
			// move the range to the right
			let diff = pointer - indexR // positive
			this.firstThumbIndexShown = this.firstThumbIndexShown + diff
			this.lastThumbIndexShown = this.lastThumbIndexShown + diff
		}
		if (pointer < indexL) {
			let diff = pointer - indexL // negative
			this.firstThumbIndexShown = this.firstThumbIndexShown + diff
			this.lastThumbIndexShown = this.lastThumbIndexShown + diff
		}

		//console.log(`_updateThumbIndexShown(): pointer: ${pointer}, ${this.firstThumbIndexShown} - ${this.lastThumbIndexShown}`)
		return true		
	}
}

customElements.define('un-gallery', UnGallery)