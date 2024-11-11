export class Context {
    unsubscribers: (() => void)[] = [];
    onMount(mountHandler: () => void | (() => void)) {
        const dismountHandler = mountHandler();
        if (dismountHandler) {
            this.onDismount(dismountHandler);
        }
    }
    onDismount(dismountHandler: () => void) {
        this.unsubscribers.push(dismountHandler);
    }
    dismount(): void {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
}

export class ClassList {
    private classSet: Set<string>;
    private subscriptions: Set<(oldName: string, newName: string) => void> = new Set();
    constructor(classArray: string[]) {
        this.classSet = new Set(classArray);
    }
    add(className: string) {
        this.classSet.add(className);
        this.triggerUpdate('', className);
    }
    remove(className: string) {
        this.classSet.delete(className);
        this.triggerUpdate(className, '');
    }
    replace(oldClassName: string, newClassName: string) {
        if (this.classSet.has(oldClassName)) {
            this.classSet.delete(oldClassName);
            this.classSet.add(newClassName);
            this.triggerUpdate(oldClassName, newClassName);
        }
    }
    contains(className: string): boolean {
        return this.classSet.has(className);
    }
    toggle(className: string) {
        if (this.classSet.has(className)) {
            this.remove(className);
        } else {
            this.add(className);
        }
    }
    triggerUpdate(oldName: string, newName: string) {
        for (const handler of this.subscriptions || []) {
            handler(oldName, newName);
        }
    }
    onUpdate(handlers: (oldName: string, newName: string) => void): () => void {
        this.subscriptions.add(handlers);
        return () => this.subscriptions.delete(handlers);
    }
    toString() {
        return Array.from(this.classSet).join(' ');
    }
}

