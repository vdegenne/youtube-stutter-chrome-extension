/**********************************************
 * !!!!!!!! DO NOT REORDER THE IMPORTS !!!!!!!!
 **********************************************/
import './internal-polyfill.js';
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import './youtube-stutter-dialog-wrapper.js';
import {YouTubeStutterDialogWrapper} from './youtube-stutter-dialog-wrapper.js';

const tagName = 'youtube-stutter-dialog-wrapper';

if (!customElements.get(tagName)) {
	customElements.define(tagName, YouTubeStutterDialogWrapper);
}

let dialog = document.querySelector<YouTubeStutterDialogWrapper>(tagName);

if (!dialog) {
	dialog = new YouTubeStutterDialogWrapper();
	document.body.append(dialog);
}

dialog.show();
