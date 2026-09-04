import {ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'

@saveToLocalStorage('youtube-stutter:store')
class Store extends ReactiveController {
	@state() stopAfterM = 0
	@state() playDurationS = 5
	@state() numberOfRepeats = 0
	@state() pauseBetweenRepeatsS = 10
	@state() innerPauseDurationS = 10

	F = new FormBuilder(this)
}

export const store = new Store()
