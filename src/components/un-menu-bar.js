import { LitElement, html, render, css } from "lit"

export default class UnMenuBar extends LitElement {
    
    static properties = {
		theme: { type: String, attribute: true, reflect: true },
		orientation: { type: String, attribute: true },
	}

    constructor() {
        super()
		this.orientation = 'horizontal'
    }

    render() {
        return html`
			<link rel="stylesheet" href='/components/un-menu-bar--core.css'>
			<link rel="stylesheet" href='/components/un-menu-bar--add.css'>
			<div class="left">
				<slot name="left"></slot>
			</div>
			<div class="right">
				<slot name="right"></slot>
			</div>
        `
    }

    handleActive(evt) {
        this.aElements.forEach(el => el.classList.remove('active'))
        evt.target.classList.add('active')
    }    
}

customElements.define('un-menu-bar', UnMenuBar)