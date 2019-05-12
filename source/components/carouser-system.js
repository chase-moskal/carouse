
import {Component, html, css} from "../toolbox/component.js"

export class CarouserSystem extends Component {

	static get styles() {
		return css`
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
		`
	}

	static get properties() {
		return {}
	}

	render() {
		return html`
			<div>
				<slot></slot>
			</div>
		`
	}
}
