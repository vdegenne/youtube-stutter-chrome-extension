import {ReactiveController, state} from '@snar/lit';
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js';

class Store extends ReactiveController {
	@state() playDurationS = 5;
	@state() innerPauseDurationS = 10;

	F = new FormBuilder(this);
}

export const store = new Store();
