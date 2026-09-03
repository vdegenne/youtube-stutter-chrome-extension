import {addOnActionClickedListener} from '@vdegenne/chrome-extension/events/onActionClicked.js';
import {addOnInstalledListener} from '@vdegenne/chrome-extension/events/onInstalled.js';
import {addOnStartupListener} from '@vdegenne/chrome-extension/events/onStartup.js';
import {DEBUG} from './debug.js';
// import {DEFAULT_OPTIONS, syncData} from './storage.js'
// import {offscreenManager} from './offscreen.js'

addOnInstalledListener(async (details) => {
	DEBUG('Initializing default data');
	// const current = await syncData.get();
	// const data = {...DEFAULT_OPTIONS, ...current};
	// await syncData.set(data);

	if (details.reason === 'install') {
		// await chrome.runtime.openOptionsPage()
	}
	// await offscreenManager.ensureDocument()
});

addOnStartupListener(async () => {
	// await offscreenManager.ensureDocument()
});

addOnActionClickedListener(async (tab) => {
	if (!tab.id || !tab.url?.startsWith('https://www.youtube.com/')) {
		return;
	}

	const [{result: initialized}] = await chrome.scripting.executeScript({
		target: {tabId: tab.id},
		world: 'ISOLATED',
		func: function () {
			const key = '__youtubeStutterInitialized';

			if ((window as any)[key]) {
				const dialog = document.querySelector(
					'youtube-stutter-dialog-wrapper',
				) as any;

				dialog?.show();

				return true;
			}

			(window as any)[key] = true;
			return false;
		},
	});

	if (!initialized) {
		await chrome.scripting.executeScript({
			target: {tabId: tab.id},
			world: 'ISOLATED',
			files: ['content.js'],
		});
	}
});
