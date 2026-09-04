import {ReactiveController, state} from '@snar/lit'
import {store} from './store.js'
import {sleep} from './utils.js'
import {VideoController} from './video.js'

export enum ControllerState {
	WAITING_RESUME = 'WAITING_RESUME',
	WAITING_PAUSE = 'WAITING_PAUSE',
	WAITING_REPEAT = 'WAITING_REPEAT',
}

class LoopController extends ReactiveController {
	@state() state: ControllerState = ControllerState.WAITING_RESUME

	@state() isRunning = false

	#video: HTMLVideoElement | undefined

	#repeatCount = 0
	#pauseAt: number | undefined
	#resumeAt: number | undefined

	#loopTimeout: number | null = null
	#videoCheckInterval: number | null = null
	#stopTimeout = 0

	#expectedPlay = false
	#expectedPause = false

	static readonly videoCheckIntervalMs = 2000

	get resumeAt() {
		return this.#resumeAt
	}

	get pauseAt() {
		return this.#pauseAt
	}

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

		const video = VideoController.getVideo()

		if (video !== this.#video) {
			this.stop()
		}
	}

	resetState() {
		this.state = ControllerState.WAITING_RESUME
		this.#repeatCount = 0
		this.#pauseAt = undefined
		this.#resumeAt = undefined
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

		this.#resumeAt = Date.now()

		this.#videoCheckInterval = window.setInterval(
			() => this.checkVideo(),
			LoopController.videoCheckIntervalMs,
		)

		if (store.stopAfterM !== 0) {
			this.#stopTimeout = window.setTimeout(
				() => {
					this.stop()
				},
				store.stopAfterM * 60 * 1000,
			)
		}

		const loop = async () => {
			if (!this.isRunning) return

			const video = this.#video

			if (!video) return

			switch (this.state) {
				case ControllerState.WAITING_RESUME:
					if (Date.now() >= this.#resumeAt!) {
						this.state = ControllerState.WAITING_PAUSE

						this.#pauseAt = video.currentTime + store.repeatEveryS

						this.#expectedPlay = true
						void video.play()
					}
					break

				case ControllerState.WAITING_PAUSE:
					if (video.currentTime >= this.#pauseAt!) {
						video.currentTime = this.#pauseAt!

						this.#expectedPause = true
						video.pause()

						this.#repeatCount++

						if (this.#repeatCount <= store.numberOfRepeats) {
							this.state = ControllerState.WAITING_REPEAT

							this.#resumeAt = Date.now() + store.pauseBetweenRepeatsS * 1000
						} else {
							video.playbackRate = 1

							this.resetState()

							this.#resumeAt = Date.now() + store.innerPauseDurationS * 1000
						}
					}
					break

				case ControllerState.WAITING_REPEAT:
					if (Date.now() >= this.#resumeAt!) {
						this.state = ControllerState.WAITING_PAUSE

						video.currentTime = Math.max(
							0,
							video.currentTime - store.repeatEveryS,
						)

						await sleep(400)

						if (!this.isRunning) return

						this.#expectedPlay = true
						void video.play()
					}
					break
			}

			if (!this.isRunning) return

			this.#loopTimeout = window.setTimeout(loop, 10)
		}

		this.#loopTimeout = window.setTimeout(loop, 10)
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

		if (this.#loopTimeout !== null) {
			clearTimeout(this.#loopTimeout)
			this.#loopTimeout = null
		}

		if (this.#videoCheckInterval !== null) {
			clearInterval(this.#videoCheckInterval)
			this.#videoCheckInterval = null
		}

		clearTimeout(this.#stopTimeout)
		this.#stopTimeout = 0

		this.#video = undefined

		this.resetState()
	}

	toggle() {
		if (!this.isRunning) {
			this.start()
		} else {
			this.stop()
		}
	}
}

export const loopController = new LoopController()
