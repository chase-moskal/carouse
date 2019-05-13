
import {Component, html, css} from "../toolbox/component.js"

export class CarouselPane extends Component {
	static get styles() {
		return css`
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}

			:host {
				display: block;
			}

			:host([hidden]), :host([hidden]) ::slotted(*) {
				display: none;
			}
		`
	}

	static get properties() {
		return {
			hidden: {type: Boolean, reflect: true}
		}
	}

	render() {
		return html`
			<slot></slot>
		`
	}
}
