import '@material/web/slider/slider.js';
import {state} from '@snar/lit';
// import {customElement} from 'custom-element-decorator';
import {html, LitElement} from 'lit';
import {store} from './store.js';

// @customElement({name: 'youtube-stutter-dialog-wrapper', inject: true})
export class YouTubeStutterDialogWrapper extends LitElement {
	@state() open = false;

	render() {
		return html`<!-- -->
			<md-dialog
				?open=${this.open}
				@closed=${() => {
					this.open = false;
				}}
			>
				<div slot="headline">YouTube Stutter</div>
				<div slot="content">
					${store.F.SLIDER('Play duration (in seconds)', 'playDurationS')}
					${store.F.SLIDER('Pause (in seconds)', 'innerPauseDurationS')}
				</div>
			</md-dialog>
			<!-- -->`;
	}

	show() {
		this.open = true;
	}
}
