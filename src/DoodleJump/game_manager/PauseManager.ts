import { EnhancedButton } from '../../components/EnhancedButton'
import { EnhancedPanel } from '../../components/EnhancedPanel'
import { UIAnimator } from '../../components/UIAnimator'
import { CONFIG } from '../../config/Config'
import { Component } from '../../core/Component'
import { GameEngine } from '../../core/GameEngine'
import { GameObject } from '../../core/GameObject'
import { UIAnchor, AnimationType } from '../../types/enums'
import { IGameObject } from '../../types/interface'
import { Color } from '../../utils/Color'
import { Vector2 } from '../../utils/Vector2'
import { GAME_CONFIG } from '../config/GameplayConfig'

export class PauseManager extends Component {
    private gameEngine: GameEngine
    private animator!: UIAnimator

    private isPaused = false
    private isSoundOn = false
    private pauseButton!: EnhancedButton
    private pauseOverlay!: EnhancedPanel
    private pauseMenu!: EnhancedPanel
    private resumeButton!: EnhancedButton
    private soundToggleButton!: EnhancedButton
    private restartButton!: EnhancedButton
    private homeButton!: EnhancedButton

    private onResumeCallback?: () => void
    private onMenuCallback?: () => void
    private onRestartCallback?: () => void

    constructor(gameObject: IGameObject) {
        super(gameObject)
    }

    public onAwake(): void {
        this.gameEngine = GameEngine.getInstance()
        this.createAnimator()
        this.createPauseButton()
        this.createSoundToggleButton()
        this.createPauseMenu()
        this.addUIToManager()
    }

    private createAnimator(): void {
        const animatorGO = new GameObject({ name: 'PauseAnimator' })
        this.animator = new UIAnimator(animatorGO)
        animatorGO.addComponent(this.animator)
        this.gameEngine.getCurrentScene()?.addGameObject(animatorGO)
    }

    private createPauseButton(): void {
        const pauseButtonGO = new GameObject({
            name: 'PauseButton',
            position: new Vector2(-96, 48),
        })

        this.pauseButton = new EnhancedButton(pauseButtonGO, '')
        const pauseIcon = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SETTINGS_BUTTON) as HTMLImageElement
        this.pauseButton.setBackgroundImage(pauseIcon)
        this.pauseButton.setAnchor(UIAnchor.TOP_RIGHT)
        this.pauseButton.size = new Vector2(64, 64)
        this.pauseButton.toggleParticleSystem(false)

        this.pauseButton.setOnClick(() => this.pauseGame())
        pauseButtonGO.addComponent(this.pauseButton)
    }

    private createSoundToggleButton(): void {
        const soundToggleGO = new GameObject({
            name: 'SoundToggleButton',
            position: new Vector2(-96, 128),
        })
        this.soundToggleButton = new EnhancedButton(soundToggleGO, '')
        const soundOnImg = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_ON_BUTTON) as HTMLImageElement
        const soundOffImg = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_OFF_BUTTON) as HTMLImageElement
        this.isSoundOn = localStorage.getItem(GAME_CONFIG.AUDIO_ENABLED_KEY) === 'true'
        this.soundToggleButton.setBackgroundImage(this.isSoundOn ? soundOnImg : soundOffImg)
        this.soundToggleButton.setAnchor(UIAnchor.TOP_RIGHT)
        this.soundToggleButton.size = new Vector2(64, 64)
        this.soundToggleButton.toggleParticleSystem(false)

        this.soundToggleButton.setOnClick(() => this.toggleSound())
        soundToggleGO.addComponent(this.soundToggleButton)
    }

    private createPauseMenu(): void {
        const overlayGO = new GameObject({
            name: 'PauseOverlay',
            position: new Vector2(0, 0),
        })

        this.pauseOverlay = new EnhancedPanel(overlayGO)
        this.pauseOverlay.setAnchor(UIAnchor.TOP_LEFT)
        this.pauseOverlay.size = new Vector2(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT)
        this.pauseOverlay.setGradient([new Color(0, 0, 0, 0.7), new Color(0, 0, 0, 0.7)])
        this.pauseOverlay.cornerRadius = 0
        this.pauseOverlay.borderWidth = 0
        this.pauseOverlay.setVisible(false)
        overlayGO.addComponent(this.pauseOverlay)

        const menuGO = new GameObject({
            name: 'PauseMenu',
            position: new Vector2(-100, -300),
        })

        this.pauseMenu = new EnhancedPanel(menuGO)
        this.pauseMenu.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.pauseMenu.size = new Vector2(400, 600)
        this.pauseMenu.setGradient([new Color(0, 0, 0, 0), new Color(0, 0, 0, 0)])
        this.pauseMenu.cornerRadius = 0
        this.pauseMenu.borderWidth = 0
        const backgroundImage = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BACKGROUND.PAUSE_PANEL_BACKGROUND) as HTMLImageElement
        this.pauseMenu.setBackgroundImage(backgroundImage, 'cover')
        menuGO.addComponent(this.pauseMenu)

        this.pauseOverlay.addChild(this.pauseMenu)

        const resumeGO = new GameObject({
            name: 'ResumeButton',
            position: new Vector2(-32, 48),
        })

        this.resumeButton = new EnhancedButton(resumeGO, '')
        const resumeIcon = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.RESUME_BUTTON) as HTMLImageElement
        this.resumeButton.setBackgroundImage(resumeIcon)
        this.resumeButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.resumeButton.size = new Vector2(64, 64)
        this.resumeButton.toggleParticleSystem(false)
        this.resumeButton.setOnClick(() => this.resumeGame())
        resumeGO.addComponent(this.resumeButton)
        this.pauseMenu.addChild(this.resumeButton)

        const restartGO = new GameObject({
            name: 'RestartButton',
            position: new Vector2(-32, 128),
        })
        this.restartButton = new EnhancedButton(restartGO, '')
        const restartIcon = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.RESTART_BUTTON) as HTMLImageElement
        this.restartButton.setBackgroundImage(restartIcon)
        this.restartButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.restartButton.size = new Vector2(64, 64)
        this.restartButton.toggleParticleSystem(false)
        this.restartButton.setOnClick(() => this.restartGame())
        restartGO.addComponent(this.restartButton)
        this.pauseMenu.addChild(this.restartButton)

        const homeGO = new GameObject({
            name: 'HomeButton',
            position: new Vector2(-32, 208),
        })
        this.homeButton = new EnhancedButton(homeGO, '')
        const homeIcon = GameEngine.getInstance()
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.BACK_BUTTON) as HTMLImageElement

        this.homeButton.setBackgroundImage(homeIcon)
        this.homeButton.setAnchor(UIAnchor.MIDDLE_CENTER)
        this.homeButton.size = new Vector2(64, 64)
        this.homeButton.toggleParticleSystem(false)
        this.homeButton.setOnClick(() => this.goToMainMenu())
        homeGO.addComponent(this.homeButton)
        this.pauseMenu.addChild(this.homeButton)
    }

    private addUIToManager(): void {
        const uiManager = this.gameEngine.getUIManager()
        if (uiManager) {
            uiManager.addRootElement(this.pauseButton)
            uiManager.addRootElement(this.soundToggleButton)
            uiManager.addRootElement(this.pauseOverlay)
        }
    }

    private toggleSound(): void {
        this.isSoundOn = !this.isSoundOn
        localStorage.setItem(GAME_CONFIG.AUDIO_ENABLED_KEY, String(this.isSoundOn))
        const imgSoundOn = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_ON_BUTTON)
        const imgSoundOff = this.gameEngine
            .getResourceManager()
            .getResource(GAME_CONFIG.IMAGES.BUTTON.SOUND_OFF_BUTTON)
        this.soundToggleButton.setBackgroundImage(
            this.isSoundOn ? (imgSoundOn as HTMLImageElement) : (imgSoundOff as HTMLImageElement)
        )

        this.gameEngine.getAudioManager().setEnabled(this.isSoundOn)
    }

    public pauseGame(): void {
        if (this.isPaused) return

        this.isPaused = true

        this.pauseOverlay.setVisible(true)

        this.animator.animate(this.pauseOverlay, {
            type: AnimationType.FadeIn,
            duration: 600,
        })

        this.animator.animate(this.pauseMenu, {
            type: AnimationType.SLIDE_IN_FROM_TOP,
            duration: 600,
            onComplete: () => {
                this.gameEngine.pause()
                this.pauseMenu.setLocalPosition(new Vector2(-100, -300))
            },
        })
    }

    public resumeGame(): void {
        if (!this.isPaused) return

        this.gameEngine.resume()
        this.isPaused = false

        if (this.onResumeCallback) {
            this.onResumeCallback()
        }

        this.animator.animate(this.pauseMenu, {
            type: AnimationType.SLIDE_OUT_TO_TOP,
            duration: 600,
            onComplete: () => {
                this.pauseMenu.setLocalPosition(new Vector2(-100, -300))
            },
        })

        this.animator.animate(this.pauseOverlay, {
            type: AnimationType.FADE_OUT,
            duration: 600,
            onComplete: () => {
                this.pauseOverlay.setVisible(false)
            },
        })
    }

    private restartGame(): void {
        this.resumeGame()
        setTimeout(() => {
            if (this.onRestartCallback) {
                this.onRestartCallback()
            }
        }, 300)
    }

    private goToMainMenu(): void {
        this.resumeGame()
        setTimeout(() => {
            if (this.onMenuCallback) {
                this.onMenuCallback()
            }
        }, 300)
    }

    public isPauseActive(): boolean {
        return this.isPaused
    }

    public setOnResume(callback: () => void): void {
        this.onResumeCallback = callback
    }

    public setOnMenu(callback: () => void): void {
        this.onMenuCallback = callback
    }

    public setOnRestart(callback: () => void): void {
        this.onRestartCallback = callback
    }

    public getPauseOverlay(): EnhancedPanel {
        return this.pauseOverlay
    }
    public getPauseMenu(): EnhancedPanel {
        return this.pauseMenu
    }
    public getPauseButton(): EnhancedButton {
        return this.pauseButton
    }
    public getSoundToggleButton(): EnhancedButton {
        return this.soundToggleButton
    }

    public update(deltaTime: number): void {
        if (this.isPaused && this.animator) {
            this.animator.update(deltaTime)
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {}
}
