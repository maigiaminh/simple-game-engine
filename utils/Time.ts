export class Time {
    private static _deltaTime: number = 0;
    private static _unscaledDeltaTime: number = 0;
    private static _totalTime: number = 0;
    private static _timeScale: number = 1;
    private static _frameCount: number = 0;
    private static _fps: number = 0;
    private static _lastFpsUpdate: number = 0;
    private static _fpsFrameCount: number = 0;

    public static get deltaTime(): number {
        return this._deltaTime * this._timeScale;
    }

    public static get unscaledDeltaTime(): number {
        return this._unscaledDeltaTime;
    }

    public static get totalTime(): number {
        return this._totalTime;
    }

    public static get timeScale(): number {
        return this._timeScale;
    }

    public static set timeScale(value: number) {
        this._timeScale = Math.max(0, value);
    }

    public static get frameCount(): number {
        return this._frameCount;
    }

    public static get fps(): number {
        return this._fps;
    }

    public static update(deltaTime: number): void {
        this._unscaledDeltaTime = deltaTime;
        this._deltaTime = deltaTime;
        this._totalTime += deltaTime;
        this._frameCount++;

        this._fpsFrameCount++;
        const currentTime = this._totalTime;
        if (currentTime - this._lastFpsUpdate >= 1000) {
            this._fps = Math.round(this._fpsFrameCount * 1000 / (currentTime - this._lastFpsUpdate));
            this._fpsFrameCount = 0;
            this._lastFpsUpdate = currentTime;
        }
    }

    public static reset(): void {
        this._deltaTime = 0;
        this._unscaledDeltaTime = 0;
        this._totalTime = 0;
        this._frameCount = 0;
        this._fps = 0;
        this._lastFpsUpdate = 0;
        this._fpsFrameCount = 0;
    }
}