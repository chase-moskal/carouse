
import {Component, html, css} from "../toolbox/component.js"

const _activeIndex = Symbol("activeIndex")
const _forwardClickHandler = Symbol("forwardClickHandler")
const _backwardClickHandler = Symbol("backwardClickHandler")
const _totalSlottedElements = Symbol("totalSlottedElements")

export class CarouseCarousel extends Component {

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

			:host {
				display: block;
			}

			.slate {
				position: relative;
				display: block;
				min-width: 100px;
				min-height: 100px;
				background: var(--carouse-slate-bg, rgba(255,255,255, 0.1));
			}

			.slate button {
				opacity: 0.6;
				z-index: 1;
				position: absolute;
				display: block;
				top: 0;
				bottom: 0;
				margin: auto;
				padding: 0.5em;
				width: 2em;
				height: 2em;
				border: 0;
				background: var(--carouse-arrow-bg, rgba(100,100,100, 0.8));
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center center;
				color: var(--carouse-arrow-color, rgba(255,255,255, 0.5));
				cursor: pointer;
				font-size: 1.5em;
			}

			.slate button:hover,
			.slate button:focus {
				opacity: 0.8;
			}

			.slate button:active {
				opacity: 1;
			}

			.slate button:nth-child(1) {
				left: 0;
				background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16"><path fill="white" fill-rule="evenodd" d="M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5 5-5z"/></svg>');
			}

			.slate button:nth-child(2) {
				right: 0;
				background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16"><path fill="white" fill-rule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"/></svg>');
			}

			.slate button[hidden] {
				display: none;
			}

			.dots {
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				background: var(--carouse-dotbar-bg, rgba(255,255,255, 0.05));
			}

			.dots > button {
				display: block;
				border: none;
				--dotsize: var(--carouse-dot-size, 0.8em);
				width: var(--dotsize);
				height: var(--dotsize);
				margin: calc(var(--dotsize) * 1) calc(var(--dotsize) / 3);
				border-radius: var(--dotsize);
				background: var(--carouse-dot-bg, rgba(255,255,255, 0.3));
				cursor: pointer;
			}

			.dots > button:hover,
			.dots > button:focus {
				background: var(--carouse-dot-bg-hover, rgba(255,255,255, 0.6));
			}

			.dots > button[active],
			.dots > button:active {
				background: var(--carouse-dot-bg-active, rgba(255,255,255, 1));
			}
		`
	}

	static get properties() {
		return {
			[_activeIndex]: {type: Number}
		}
	}

	constructor() {
		super()
		this[_activeIndex] = 0
		this[_forwardClickHandler] = () => this.forward()
		this[_backwardClickHandler] = () => this.backward()
		this.shadowRoot.addEventListener("slotchange", () => this.requestUpdate())
	}

	jump(index) {
		const doable = (
			index < this[_totalSlottedElements]
				&&
			index >= 0
		)
		if (doable)
			this[_activeIndex] = index
		return doable
	}

	forward() {
		return this.jump(this[_activeIndex] + 1)
	}

	backward() {
		return this.jump(this[_activeIndex] - 1)
	}

	updated() {
		const slot = this.shadowRoot.querySelector("slot")
		const activeIndex = this[_activeIndex]
		const slottedElements = slot.assignedElements()
		slottedElements.forEach((slotted, index) => {
			const active = index === activeIndex
			slotted.hidden = !active
		})
		this[_totalSlottedElements] = slottedElements.length
	}

	render() {
		const activeIndex = this[_activeIndex]
		const first = activeIndex === 0
		const last = activeIndex === (this[_totalSlottedElements] - 1)

		const renderDots = () => {
			const dots = []
			for (let i = 0; i < this[_totalSlottedElements]; i++) {
				dots.push(html`
					<button
						tabindex="0"
						?active="${i === this[_activeIndex]}"
						@click="${() => this.jump(i)}">
					</button>
				`)
			}
			return html`<div class="dots">${dots}</div>`
		}

		return html`
			<div class="slate">
				<button @click="${this[_backwardClickHandler]}" ?hidden="${first}"></button>
				<button @click="${this[_forwardClickHandler]}" ?hidden="${last}"></button>
				<slot></slot>
			</div>
			${renderDots()}
		`
	}
}
