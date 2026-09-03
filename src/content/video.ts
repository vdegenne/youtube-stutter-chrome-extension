type VideoFps = {
	video: HTMLVideoElement
	fps: number
}

export class VideoController {
	private static readonly fpsCache = new WeakMap<HTMLVideoElement, number>()

	private static readonly fpsDetection = new WeakMap<
		HTMLVideoElement,
		Promise<VideoFps | undefined>
	>()

	static getVideo(
		filter?: (videos: HTMLVideoElement[]) => HTMLVideoElement | undefined,
	): HTMLVideoElement | undefined {
		const videos = Array.from(document.querySelectorAll('video'))

		if (filter) {
			return filter(videos)
		}

		return videos
			.map((video) => ({
				video,
				score: this.getVideoScore(video),
			}))
			.sort((a, b) => b.score - a.score)[0]?.video
	}

	private static getVideoScore(video: HTMLVideoElement): number {
		const rect = video.getBoundingClientRect()

		const visibleWidth = Math.max(
			0,
			Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
		)

		const visibleHeight = Math.max(
			0,
			Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
		)

		const visibleArea = visibleWidth * visibleHeight
		const area = rect.width * rect.height

		let score = 0

		if (visibleArea > 0) {
			score += 1000
			score += visibleArea / 1000
		}

		if (area > 0) {
			score += (visibleArea / area) * 500
		}

		if (!video.paused) {
			score += 500
		}

		score += Math.min(area / 10000, 500)

		return score
	}

	static determineFps(): Promise<VideoFps | undefined> {
		const video = this.getVideo()
		if (!video) {
			return Promise.resolve(undefined)
		}

		const cachedFps = this.fpsCache.get(video)

		if (cachedFps !== undefined) {
			return Promise.resolve({
				video,
				fps: cachedFps,
			})
		}

		const existingDetection = this.fpsDetection.get(video)
		if (existingDetection) {
			return existingDetection
		}

		if (!('requestVideoFrameCallback' in video)) {
			return Promise.resolve(undefined)
		}

		const detection = new Promise<VideoFps | undefined>((resolve) => {
			let previousMediaTime: number | undefined
			let previousPresentedFrames: number | undefined
			const samples: number[] = []

			const callback = (_: number, metadata: VideoFrameCallbackMetadata) => {
				if (
					previousMediaTime !== undefined &&
					previousPresentedFrames !== undefined
				) {
					const deltaTime = metadata.mediaTime - previousMediaTime

					const deltaFrames = metadata.presentedFrames - previousPresentedFrames

					if (deltaTime > 0 && deltaFrames > 0) {
						samples.push(deltaFrames / deltaTime)
					}
				}

				previousMediaTime = metadata.mediaTime
				previousPresentedFrames = metadata.presentedFrames

				if (samples.length >= 5) {
					samples.sort((a, b) => a - b)

					const fps = samples[Math.floor(samples.length / 2)]

					this.fpsCache.set(video, fps)

					resolve({video, fps})
					return
				}

				video.requestVideoFrameCallback(callback)
			}

			video.requestVideoFrameCallback(callback)
		})

		this.fpsDetection.set(video, detection)

		void detection.finally(() => {
			this.fpsDetection.delete(video)
		})

		return detection
	}

	private static getVideoFps(video: HTMLVideoElement): number | undefined {
		return this.fpsCache.get(video)
	}

	static goBack(stepS = 3): void {
		const video = this.getVideo()
		if (!video) return

		video.currentTime = Math.max(0, video.currentTime - stepS)
	}

	static goForward(stepS = 3): void {
		const video = this.getVideo()
		if (!video) return

		video.currentTime = Math.min(video.duration, video.currentTime + stepS)
	}

	static oneFrameBack(): void {
		const video = this.getVideo()
		if (!video) return

		const fps = this.getVideoFps(video)
		if (!fps) return

		const frameDuration = 1 / fps

		video.currentTime = Math.max(0, video.currentTime - frameDuration)
	}

	static oneFrameForward(): void {
		const video = this.getVideo()
		if (!video) return

		const fps = this.getVideoFps(video)
		if (!fps) return

		const frameDuration = 1 / fps

		video.currentTime = Math.min(
			video.duration,
			video.currentTime + frameDuration,
		)
	}

	static play(): void {
		const video = this.getVideo()
		if (!video) return

		video.play()
	}

	static pause(): void {
		const video = this.getVideo()
		if (!video) return

		video.pause()
	}

	static togglePlay(): void {
		const video = this.getVideo()
		if (!video) return

		video.paused ? video.play() : video.pause()
	}

	static async toggleFullscreen(): Promise<void> {
		const video = this.getVideo()
		if (!video) return

		if (document.fullscreenElement) {
			await document.exitFullscreen()
		} else {
			await video.requestFullscreen()
		}
	}

	static toggleControls(): void {
		const video = this.getVideo()
		if (!video) return

		video.controls = !video.controls
	}
}
