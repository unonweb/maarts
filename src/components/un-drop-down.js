import { LitElement, html, render, css } from "lit"

export default class UnDropDown extends LitElement {
    
	static properties = {
		openOn: { type: String, reflect: true, attribute: true },
		title: { type: String, reflect: true, attribute: true },
		overlay: { type: Boolean, reflect: true, attribute: true },
		theme: { type: String, attribute: true, reflect: true },

	}

    constructor() {
        super()
		this.openOn = 'click'
		this.title = 'menu'
		this.overlay = false
    }

	firstUpdated() {
		this.button = this.shadowRoot.querySelector('button')
		this.dropContent = this.shadowRoot.querySelector('.drop-content')

		// add event listeners
		switch (this.openOn) {
			case 'click':
				// open click
				this.button.addEventListener('click', () => {
					this.dropContent.classList.toggle('active')
				})
				// close click
				document.addEventListener('click', (evt) => {
					if (!this.shadowRoot.host.contains(evt.target)) {
						// if evt.target (where the user clicked) is not contained within the customElement
						this.dropContent.classList.remove('active')
					}
				})
				break
			case 'hover':
				// open hover
				this.button.addEventListener('mouseover', () => {
					this.dropContent.classList.add('active')
				})
				// close hover
				this.shadowRoot.host.addEventListener('mouseleave', () => {
					this.dropContent.classList.remove('active')
				})
				break
		}
	}

    render() {
        console.log('render()')
        return html`
			<link rel="stylesheet" href='/components/un-drop-down--core.css'>
			<link rel="stylesheet" href='/components/un-drop-down--add.css'>
			<button>
				<slot name="icon"></slot>
				${this.title}
			</button>
			<div class="drop-content">
				<slot></slot>
			</div>
		`
    }

}

customElements.define('un-drop-down', UnDropDown)