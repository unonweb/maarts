import { LitElement, css, html } from 'lit'

export default class UnHeader extends LitElement {

	static properties = {
		slottedElements: { type: Array, attribute: false },
		transfx: { type: String, attribute: true, reflext: true },
		transtime: { type: Number, attribute: true },
	}

	constructor() {
		super()
		// initialize public
		this.transfx = 'grey'
		this.transtime = 5000
		// internal properties
		this._slideReverse = false
		this._shownImgIndex = 0

	}

  	render() {
		console.log('render()')

    	return html`
			<link rel="stylesheet" href='/components/un-header--core.css'>
			<slot></slot>
    	`
  	}

	firstUpdated() {
		console.log('firstUpdated()')
		let slots = this.shadowRoot.querySelector('slot')
		this.slottedElements = slots.assignedElements({flatten: true})
		if (this.slottedElements.length === 0) console.error('this.slottedElements.length === 0')
		else if (this.slottedElements.length === 1) {
			//console.log('single img found: ', this.slottedElements)
			this.slottedElements[this._shownImgIndex].classList.add('show') // showcase first img
		}
		else if (this.slottedElements.length > 1) {
			console.log('multiple imgs found: ', this.slottedElements)
			this.slottedElements[this._shownImgIndex].classList.add('show') // showcase first img
			setInterval(this.slideImgIndex.bind(this), this.transtime)
		}
	}

	slideImgIndex() {
		//console.log('slideImgIndex()')
		let currIndex = this._shownImgIndex
		let newIndex

		// set slide direction
		if (currIndex === this.slottedElements.length - 1) {
			this._slideReverse = true
		}
		if (currIndex === 0) {
			this._slideReverse = false
		}
		
		if (this._slideReverse) {
			newIndex = currIndex - 1
		} else {
			newIndex = currIndex + 1
		}

		this.slottedElements[currIndex].classList.remove('show') // 
		this.slottedElements[newIndex].classList.add('show') // 

		// finally change the index
		this._shownImgIndex = newIndex // update index
	}
}

customElements.define('un-header', UnHeader)