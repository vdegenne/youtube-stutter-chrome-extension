/******************************************
 * !!!!!!!! DO NOT REORDER THIS !!!!!!!
 ******************************************/
import './internal-polyfill.ts';
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
