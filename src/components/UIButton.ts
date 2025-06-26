import { GameEngine } from '../core/GameEngine'
import { GameObject } from '../core/GameObject'
import { GAME_CONFIG } from '../DoodleJump/config/GameplayConfig'
import { ButtonState, UIAnchor } from '../types/enums'
import { IGameObject } from '../types/interface'
import { Color } from '../utils/Color'
import { Vector2 } from '../utils/Vector2'
import { UILabel } from './UILabel'
import { UIPanel } from './UIPanel'

export class UIButton extends UIPanel {
    public label: UILabel | null = null
    public state: ButtonState = ButtonState.NORMAL

    public normalColor: RGBAColor = Color.GRAY
    public hoverColor: RGBAColor = Color.LIGHT_GRAY
    public pressedColor: RGBAColor = Color.DARK_GRAY
    public disabledColor: RGBAColor = new Color(64, 64, 64, 128)

    public normalTextColor: RGBAColor = Color.WHITE
    public hoverTextColor: RGBAColor = Color.WHITE
    public pressedTextColor: RGBAColor = Color.LIGHT_GRAY
    public disabledTextColor: RGBAColor = Color.DARK_GRAY

    private onClick: (() => void) | null = null
    private onHover: (() => void) | null = null
    private onPress: (() => void) | null = null
    private onRelease: (() => void) | null = null

    private isMouseOver = false
    private isMouseDown = false

    constructor(gameObject: IGameObject, text = 'Button') {
        super(gameObject)

        const labelGO = new GameObject({ name: 'ButtonLabel', position: new Vector2(0, 0) })
        const label = new UILabel(labelGO, text)
        label.textAlign = 'center'
        label.textBaseline = 'middle'

        this.label = label
        this.anchor = UIAnchor.MIDDLE_CENTER

        this.addChild(this.label)

        this.updateAppearance()
    }

    public setText(text: string): void {
        if (this.label) {
            this.label.setText(text)
        }
    }

    public setOnClick(callback: () => void): void {
        this.onClick = callback
    }

    public setOnHover(callback: () => void): void {
        this.onHover = callback
    }

    public setOnPress(callback: () => void): void {
        this.onPress = callback
    }

    public setOnRelease(callback: () => void): void {
        this.onRelease = callback
    }

    public setColors(background: RGBAColor, text: RGBAColor, hover: RGBAColor): void {
        this.normalColor = background
        this.normalTextColor = text
        this.hoverColor = hover
        this.updateAppearance()
    }

    public setEnabled(enabled: boolean): void {
        super.setEnabled(enabled)
        this.state = enabled ? ButtonState.NORMAL : ButtonState.DISABLED
        this.updateAppearance()
    }

    public handleMouseMove(mousePos: Vector2): void {
        if (!this.isEnabled()) return

        const bounds = this.getWorldBounds()
        const wasMouseOver = this.isMouseOver

        this.isMouseOver =
            mousePos.x >= bounds.x &&
            mousePos.x <= bounds.x + bounds.width &&
            mousePos.y >= bounds.y &&
            mousePos.y <= bounds.y + bounds.height

        if (this.isMouseOver && !wasMouseOver) {
            this.state = this.isMouseDown ? ButtonState.PRESSED : ButtonState.HOVERED
            this.onHover?.()
        } else if (!this.isMouseOver && wasMouseOver) {
            this.state = ButtonState.NORMAL
        }

        this.updateAppearance()
    }

    public handleMouseDown(mousePos: Vector2): void {
        if (!this.isEnabled() || !this.isMouseOver) return

        this.isMouseDown = true
        this.state = ButtonState.PRESSED
        this.onPress?.()
        this.updateAppearance()
        GameEngine.getInstance().getAudioManager().playSound(GAME_CONFIG.AUDIO.SFX.BUTTON_CLICK)
    }

    public handleMouseUp(mousePos: Vector2): void {
        if (!this.isEnabled()) return

        const wasMouseDown = this.isMouseDown
        this.isMouseDown = false

        if (wasMouseDown && this.isMouseOver) {
            this.onClick?.()
        }

        this.state = this.isMouseOver ? ButtonState.HOVERED : ButtonState.NORMAL
        this.onRelease?.()
        this.updateAppearance()
    }

    private updateAppearance(): void {
        switch (this.state) {
            case ButtonState.NORMAL:
                this.backgroundColor = this.normalColor
                if (this.label) this.label.color = this.normalTextColor
                break
            case ButtonState.HOVERED:
                this.backgroundColor = this.hoverColor
                if (this.label) this.label.color = this.hoverTextColor
                break
            case ButtonState.PRESSED:
                this.backgroundColor = this.pressedColor
                if (this.label) this.label.color = this.pressedTextColor
                break
            case ButtonState.DISABLED:
                this.backgroundColor = this.disabledColor
                if (this.label) this.label.color = this.disabledTextColor
                break
        }
    }

    public serialize(): SerializedData {
        return {
            ...super.serialize(),
            state: this.state,
            normalColor: this.normalColor,
            hoverColor: this.hoverColor,
            pressedColor: this.pressedColor,
            disabledColor: this.disabledColor,
            normalTextColor: this.normalTextColor,
            hoverTextColor: this.hoverTextColor,
            pressedTextColor: this.pressedTextColor,
            disabledTextColor: this.disabledTextColor,
        }
    }

    public deserialize(data: SerializedData): void {
        super.deserialize(data)
        if (typeof data.state === 'string') {
            this.state = data.state as ButtonState
        }
        if (Color.isRGBAColor(data.normalColor)) {
            this.normalColor = data.normalColor
        }
        if (Color.isRGBAColor(data.hoverColor)) {
            this.hoverColor = data.hoverColor
        }

        this.updateAppearance()
    }
}
