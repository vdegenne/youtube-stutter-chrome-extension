(function () {
	// console.log('[attachInternals-polyfill] Overriding HTMLElement.prototype.attachInternals');

	function DummyInternals() {
		// console.log('[DummyInternals] Created for element:', this._element);
	}

	DummyInternals.prototype = {
		setFormValue: function (value, state) {
			// console.log('[DummyInternals] setFormValue called with:', value, state);
		},
		setValidity: function (validity, message, anchor) {
			// console.log('[DummyInternals] setValidity called with:', validity, message, anchor);
		},
		checkValidity: function () {
			// console.log('[DummyInternals] checkValidity called');
			return true;
		},
		reportValidity: function () {
			// console.log('[DummyInternals] reportValidity called');
			return true;
		},
		shadowRoot: null,
		form: null,
		labels: [],
		role: '',
		states: new Set(),
	};

	HTMLElement.prototype.attachInternals = function () {
		if (!this._internalsPolyfill) {
			// console.log('[attachInternals-polyfill] Creating DummyInternals for element:', this);
			const internals = new DummyInternals();
			internals._element = this;
			this._internalsPolyfill = internals;
		} else {
			// console.log('[attachInternals-polyfill] Returning existing DummyInternals for element:', this);
		}
		return this._internalsPolyfill;
	};
})();
