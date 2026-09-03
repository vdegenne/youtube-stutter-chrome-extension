import '@material/web/iconbutton/icon-button.js'
import '@material/web/slider/slider.js'
import '@material/web/textfield/filled-text-field.js'
// import '@material/web/textfield/outlined-text-field.js';
import {state, withController} from '@snar/lit'
import {css, html, LitElement} from 'lit'
import {store} from './store.js'
import {withStyles} from 'lit-with-styles'
import styles from '../UI/styles/stylesheets/shared.css?inline'
import {loopController} from './loopController.js'

@withStyles(
	css`
		:host,
		:host * {
			/*font-family: initial;*/
			font-size: initial;
		}
	`,
	styles,
)
@withController(loopController)
@withController(store)
export class YouTubeStutterDialogWrapper extends LitElement {
	@state() open = false

	render() {
		return html`<!-- -->
			<md-dialog
				?open="${this.open}"
				@closed="${() => {
					this.open = false
				}}"
				class="text-xl"
			>
				<div slot="headline">YouTube Stutter</div>
				<div slot="content" class="px-8 py-10 flex flex-col gap-5">
					${store.F.TEXTFIELD('Duration before stop', 'repeatEveryS', {
						type: 'number',
						suffixText: 'seconds',
					})}
					${store.F.TEXTFIELD('Pause duration', 'innerPauseDurationS', {
						type: 'number',
						suffixText: 'seconds',
						supportingText: 'Duration before resuming video',
					})}
					<md-divider></md-divider>
					${store.F.TEXTFIELD('Number of repeats', 'numberOfRepeats', {
						type: 'number',
						supportingText: 'Set to 0 for no repeat',
					})}
					${store.F.TEXTFIELD(
						'Pause between each repeat',
						'pauseBetweenRepeatsS',
						{
							disabled: store.numberOfRepeats === 0,
							type: 'number',
							suffixText: 'seconds',
						},
					)}
				</div>

				<div slot="actions">
					<md-text-button @click="${() => this.close()}">Close</md-text-button>
					<md-filled-tonal-button
						@click="${() => {
							if (loopController.isRunning) {
								loopController.stop()
							} else {
								loopController.start()
								this.close()
							}
						}}"
						>${loopController.isRunning ? 'Stop' : 'Start'}</md-filled-tonal-button
					>
				</div>
			</md-dialog>
			<!-- -->`
	}

	show() {
		this.open = true
	}
	close() {
		this.open = false
	}
}
