import {ReactiveController, state} from '@snar/lit'
import {store} from './store.js'
import {VideoController} from './video.js'

export enum ControllerState {
	PLAYING = 'PLAYING',
	PAUSED_BETWEEN_REPEATS = 'PAUSED_BETWEEN_REPEATS',
	PAUSED_INNER = 'PAUSED_INNER',
}

class LoopController extends ReactiveController {
	@state() state: ControllerState = ControllerState.PLAYING
	@state() isRunning = false

	#video: HTMLVideoElement | undefined

	#repeatCount = 0

	#timeout: number | null = null
	#videoCheckInterval: number | null = null
	#stopTimeout: number | null = null

	#expectedPlay = false
	#expectedPause = false

	static readonly videoCheckIntervalMs = 2000
	static readonly repeatStartDelayMs = 400

	private handleVideoPlay = () => {
		if (this.#expectedPlay) {
			this.#expectedPlay = false
			return
		}

		this.stop()
	}

	private handleVideoPause = () => {
		if (this.#expectedPause) {
			this.#expectedPause = false
			return
		}

		this.stop()
	}

	private checkVideo() {
		if (!this.isRunning) return

		if (VideoController.getVideo() !== this.#video) {
			this.stop()
		}
	}

	private schedule(callback: () => void, delay: number) {
		if (!this.isRunning) return

		this.#timeout = window.setTimeout(() => {
			this.#timeout = null

			if (!this.isRunning) return

			callback()
		}, delay)
	}

	private playSegment() {
		if (!this.isRunning) return

		const video = this.#video

		if (!video) return

		this.state = ControllerState.PLAYING
		this.#expectedPlay = true
		void video.play()

		this.schedule(() => this.finishSegment(), store.playDurationS * 1000)
	}

	private finishSegment() {
		if (!this.isRunning) return

		const video = this.#video

		if (!video) return

		this.#expectedPause = true
		video.pause()

		this.#repeatCount++

		if (this.#repeatCount <= store.numberOfRepeats) {
			this.state = ControllerState.PAUSED_BETWEEN_REPEATS

			this.schedule(() => this.startRepeat(), store.pauseBetweenRepeatsS * 1000)
		} else {
			video.playbackRate = 1

			this.#repeatCount = 0
			this.state = ControllerState.PAUSED_INNER

			this.schedule(() => this.playSegment(), store.innerPauseDurationS * 1000)
		}
	}

	private startRepeat() {
		if (!this.isRunning) return

		const video = this.#video

		if (!video) return

		video.currentTime = Math.max(0, video.currentTime - store.playDurationS)

		this.schedule(() => this.playSegment(), LoopController.repeatStartDelayMs)
	}

	resetState() {
		this.state = ControllerState.PLAYING
		this.#repeatCount = 0
	}

	async updateState() {}

	start() {
		if (this.isRunning) return

		const video = VideoController.getVideo()

		if (!video) return

		this.#video = video
		this.isRunning = true
		this.resetState()

		video.addEventListener('play', this.handleVideoPlay)
		video.addEventListener('pause', this.handleVideoPause)

		this.#videoCheckInterval = window.setInterval(
			() => this.checkVideo(),
			LoopController.videoCheckIntervalMs,
		)

		if (store.stopAfterM !== 0) {
			this.#stopTimeout = window.setTimeout(
				() => this.stop(),
				store.stopAfterM * 60 * 1000,
			)
		}

		this.playSegment()
	}

	stop() {
		const video = this.#video

		if (video) {
			video.removeEventListener('play', this.handleVideoPlay)
			video.removeEventListener('pause', this.handleVideoPause)

			video.pause()
			video.playbackRate = 1
		}

		this.#expectedPlay = false
		this.#expectedPause = false
		this.isRunning = false

		if (this.#timeout !== null) {
			clearTimeout(this.#timeout)
			this.#timeout = null
		}

		if (this.#videoCheckInterval !== null) {
			clearInterval(this.#videoCheckInterval)
			this.#videoCheckInterval = null
		}

		if (this.#stopTimeout !== null) {
			clearTimeout(this.#stopTimeout)
			this.#stopTimeout = null
		}

		this.#video = undefined

		this.resetState()
	}

	toggle() {
		if (this.isRunning) {
			this.stop()
		} else {
			this.start()
		}
	}
}

export const loopController = new LoopController()
