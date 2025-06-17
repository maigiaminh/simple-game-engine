class GameEventImplement implements GameEvent {
    public type: string;
    public target: any;
    public currentTarget: any;
    public phase: EventPhase;
    public bubbles: boolean;
    public cancelable: boolean;
    public defaultPrevented: boolean = false;
    public timeStamp: number;
    public data?: any;

    private _propagationStopped: boolean = false;

    constructor(type: string, options: { bubbles?: boolean, cancelable?: boolean, data?: any } = {}) {
        this.type = type;
        this.bubbles = options.bubbles || false;
        this.cancelable = options.cancelable || false;
        this.data = options.data;
        this.timeStamp = Time.totalTime;
        this.phase = EventPhase.Target;
    }

    public preventDefault(): void {
        if (this.cancelable) {
            this.defaultPrevented = true;
        }
    }

    public stopPropagation(): void {
        this._propagationStopped = true;
    }

    public stopImmediatePropagation(): void {
        this._propagationStopped = true;
    }

    public get propagationStopped(): boolean {
        return this._propagationStopped;
    }
}

class EventEmitter implements IEventEmitter {
    private events: Map<string, Array<{ listener: GameEventListener, options: GameEventListenerOptions }>> = new Map();

    public addEventListener(type: string, listener: GameEventListener, options: GameEventListenerOptions = {}): void {
        if (!this.events.has(type)) {
            this.events.set(type, []);
        }
        
        const listeners = this.events.get(type)!;
        listeners.push({ listener, options });
        
        listeners.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));
    }

    public removeEventListener(type: string, listener: GameEventListener): void {
        const listeners = this.events.get(type);
        if (listeners) {
            const index = listeners.findIndex(l => l.listener === listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    public dispatchEvent(event: GameEvent | string, data?: any): boolean {
        const evt = typeof event === 'string' ? new GameEventImplement(event, { data }) : event;
        
        if (!evt.target) {
            evt.target = this;
        }
        evt.currentTarget = this;

        const listeners = this.events.get(evt.type);
        if (listeners) {
            for (const { listener, options } of listeners) {
                try {
                    listener.call(this, evt);
                    
                    if (options.once) {
                        this.removeEventListener(evt.type, listener);
                    }
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            }
        }

        return !evt.defaultPrevented;
    }

    public removeAllEventListeners(type?: string): void {
        if (type) {
            this.events.delete(type);
        } else {
            this.events.clear();
        }
    }
}