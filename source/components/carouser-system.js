
import {Component, html, css} from "../toolbox/component.js"

const _totalSlottedElements = Symbol("totalSlottedElements")
const _forwardClickHandler = Symbol("forwardClickHandler")
const _backwardClickHandler = Symbol("backwardClickHandler")

export class CarouserSystem extends Component {

	static get styles() {
		return css`
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}

			*:focus {
				outline: var(--focus-outline, 2px solid #0ef);
			}

			.slate {
				position: relative;
				display: block;
				min-width: 100px;
				min-height: 50px;
				background: rgba(255,255,255, 0.1);
			}

			.slate button {
				z-index: 1;
				position: absolute;
				top: 0;
				bottom: 0;
				height: 2em;
				display: block;
				padding: 0.5em;
				border: 0;
				margin: auto;
				background: rgba(100,100,100, 0.2);
				color: white;
			}

			.slate button:nth-child(1) {
				left: 0;
			}

			.slate button:nth-child(2) {
				right: 0;
			}

			.slate button[hidden] {
				display: none;
			}

			.dots {
				width: 100%;
				height: 1em;
				background: rgba(255,255,255, 0.05);
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.dots > button {
				display: block;
				border: none;
				width: 0.5em;
				height: 0.5em;
				margin: 0 0.2em;
				border-radius: 0.5em;
				background: rgba(255,255,255, 0.2);
			}

			.dots > button[active] {
				background: rgba(255,255,255, 0.6);
			}
		`
	}

	static get properties() {
		return {
			"active-index": {type: Number, reflect: true}
		}
	}

	constructor() {
		super()
		this["active-index"] = 0
		this.shadowRoot.addEventListener("slotchange", () => this.requestUpdate())
		this[_forwardClickHandler] = () => this.forward()
		this[_backwardClickHandler] = () => this.backward()
	}

	jump(index) {
		const doable = (
			index < this[_totalSlottedElements]
				&&
			index >= 0
		)
		if (doable) this["active-index"] = index
		return doable
	}

	forward() {
		return this.jump(this["active-index"] + 1)
	}

	backward() {
		return this.jump(this["active-index"] - 1)
	}

	updated() {
		const slot = this.shadowRoot.querySelector("slot")
		const activeIndex = this["active-index"]
		const slottedElements = slot.assignedElements()
		slottedElements.forEach((slotted, index) => {
			const active = index === activeIndex
			slotted.hidden = !active
		})
		this[_totalSlottedElements] = slottedElements.length
	}

	render() {
		const activeIndex = this["active-index"]
		const first = activeIndex === 0
		const last = activeIndex === (this[_totalSlottedElements] - 1)

		const renderDots = () => {
			const dots = []
			for (let i = 0; i < this[_totalSlottedElements]; i++) {
				dots.push(html`
					<button
						tabindex="0"
						?active="${i === this["active-index"]}"
						@click="${() => this.jump(i)}">
					</button>
				`)
			}
			return html`<div class="dots">${dots}</div>`
		}

		return html`
			<div class="slate">
				<button @click="${this[_backwardClickHandler]}" ?hidden="${first}">←</button>
				<button @click="${this[_forwardClickHandler]}" ?hidden="${last}">→</button>
				<slot></slot>
			</div>
			${renderDots()}
		`
	}
}
