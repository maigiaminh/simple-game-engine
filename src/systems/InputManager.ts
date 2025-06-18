import { EventEmitter } from '../core/EventEmitter';
import { Time } from '../utils/Time';
import { Vector2 } from '../utils/Vector2';
import { InputType, MouseButton, TouchPhase } from '../types/enums';
import { GameTouch, IInputManager } from '../types/interface';

export class InputManager extends EventEmitter implements IInputManager {
    private keyStates: Map<string, boolean> = new Map();
    private previousKeyStates: Map<string, boolean> = new Map();
    
    private mousePosition: Vector2 = Vector2.zero();
    private mouseDelta: Vector2 = Vector2.zero();
    private mouseButtons: Map<MouseButton, boolean> = new Map();
    private previousMouseButtons: Map<MouseButton, boolean> = new Map();
    
    private touches: Map<number, GameTouch> = new Map();
    
    private canvas: HTMLCanvasElement;
    private enabled: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.onTouchCancel.bind(this));

        window.addEventListener('blur', () => {
            this.clearAllInputs();
        });
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        const key = event.code;
        
        if (!this.keyStates.get(key)) {
            this.dispatchEvent('keydown', { inputType: InputType.Keyboard, key, isPressed: true });
        }
        
        this.keyStates.set(key, true);
    }

    private onKeyUp(event: KeyboardEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        const key = event.code;
        
        this.keyStates.set(key, false);
        this.dispatchEvent('keyup', { inputType: InputType.Keyboard, key, isPressed: false });
    }

    private onMouseDown(event: MouseEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        const button = event.button as MouseButton;
        const position = this.calculateMousePosition(event);
        
        this.mouseButtons.set(button, true);
        this.dispatchEvent('mousedown', { 
            inputType: InputType.Mouse, 
            button, 
            position, 
            isPressed: true 
        });
    }

    private onMouseUp(event: MouseEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        const button = event.button as MouseButton;
        const position = this.calculateMousePosition(event);
        
        this.mouseButtons.set(button, false);
        this.dispatchEvent('mouseup', { 
            inputType: InputType.Mouse, 
            button, 
            position, 
            isPressed: false 
        });
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.enabled) return;
        
        const newPosition = this.calculateMousePosition(event);
        this.mouseDelta = newPosition.subtract(this.mousePosition);
        this.mousePosition = newPosition;
        
        this.dispatchEvent('mousemove', { 
            inputType: InputType.Mouse, 
            position: this.mousePosition, 
            delta: this.mouseDelta 
        });
    }

    private onTouchStart(event: TouchEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const position = this.getTouchPosition(touch);
            
            const touchData: GameTouch = {
                id: touch.identifier,
                position: position,
                deltaPosition: Vector2.zero(),
                startPosition: position.clone(),
                phase: TouchPhase.Began,
                pressure: touch.force || 1,
                timestamp: Time.totalTime
            };
            
            this.touches.set(touch.identifier, touchData);
            this.dispatchEvent('touchstart', { 
                inputType: InputType.Touch, 
                touchId: touch.identifier, 
                position, 
                phase: TouchPhase.Began 
            });
        }
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) continue;
            
            const newPosition = this.getTouchPosition(touch);
            touchData.deltaPosition = newPosition.subtract(touchData.position);
            touchData.position = newPosition;
            touchData.phase = TouchPhase.Moved;
            touchData.timestamp = Time.totalTime;
            
            this.dispatchEvent('touchmove', { 
                inputType: InputType.Touch, 
                touchId: touch.identifier, 
                position: newPosition, 
                delta: touchData.deltaPosition,
                phase: TouchPhase.Moved 
            });
        }
    }

    private onTouchEnd(event: TouchEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) continue;
            
            touchData.phase = TouchPhase.Ended;
            touchData.timestamp = Time.totalTime;
            
            this.dispatchEvent('touchend', { 
                inputType: InputType.Touch, 
                touchId: touch.identifier, 
                position: touchData.position,
                phase: TouchPhase.Ended 
            });
            
            this.touches.delete(touch.identifier);
        }
    }

    private onTouchCancel(event: TouchEvent): void {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches.delete(touch.identifier);
        }
    }

    private calculateMousePosition(event: MouseEvent): Vector2 {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    private getTouchPosition(touch: globalThis.Touch): Vector2{
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            touch.clientX - rect.left,
            touch.clientY - rect.top
        );
    }

    public isKeyPressed(keyCode: string): boolean {
        return this.keyStates.get(keyCode) || false;
    }

    public isKeyJustPressed(keyCode: string): boolean {
        const current = this.keyStates.get(keyCode) || false;
        const previous = this.previousKeyStates.get(keyCode) || false;
        return current && !previous;
    }

    public isKeyJustReleased(keyCode: string): boolean {
        const current = this.keyStates.get(keyCode) || false;
        const previous = this.previousKeyStates.get(keyCode) || false;
        return !current && previous;
    }

    public isMouseButtonPressed(button: MouseButton = MouseButton.Left): boolean {
        return this.mouseButtons.get(button) || false;
    }

    public isMouseButtonJustPressed(button: MouseButton = MouseButton.Left): boolean {
        const current = this.mouseButtons.get(button) || false;
        const previous = this.previousMouseButtons.get(button) || false;
        return current && !previous;
    }

    public getMousePosition(): Vector2 {
        return this.mousePosition.clone();
    }

    public getMouseDelta(): Vector2 {
        return this.mouseDelta.clone();
    }

    public getTouches(): GameTouch[] {
        return Array.from(this.touches.values());
    }

    public getTouchCount(): number {
        return this.touches.size;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clearAllInputs();
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public clearAllInputs(): void {
        this.keyStates.clear();
        this.mouseButtons.clear();
        this.touches.clear();
        this.mouseDelta = Vector2.zero();
    }

    public update(): void {
        if (!this.enabled) return;

        this.previousKeyStates.clear();
        this.keyStates.forEach((value, key) => {
            this.previousKeyStates.set(key, value);
        });

        this.previousMouseButtons.clear();
        this.mouseButtons.forEach((value, key) => {
            this.previousMouseButtons.set(key, value);
        });

        this.mouseDelta = Vector2.zero();

        this.touches.forEach(touch => {
            if (touch.phase === TouchPhase.Moved) {
                touch.phase = TouchPhase.Stationary;
                touch.deltaPosition = Vector2.zero();
            }
        });
    }
}