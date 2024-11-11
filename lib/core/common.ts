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
    private unsubscribes: (() => void)[] = [];
    constructor(classArray: string[]) {
        this.classSet = new Set(classArray);
    }
    add(className: string) {
        this.classSet.add(className);
    }
    remove(className: string) {
        this.classSet.delete(className);
    }
    replace(oldClassName: string, newClassName: string) {
        if (this.classSet.has(oldClassName)) {
            this.classSet.delete(oldClassName);
            this.classSet.add(newClassName);
        }
    }
    contains(className: string): boolean {
        return this.classSet.has(className);
    }
    toggle(className: string) {
        if (this.classSet.has(className)) {
            this.classSet.delete(className);
        } else {
            this.classSet.add(className);
        }
    }
    onUpdate(handlers: () => void): () => void {
        this.unsubscribes.push(handlers);
        return () => this.unsubscribes.splice(this.unsubscribes.indexOf(handlers), 1);
    }
    toString() {
        return Array.from(this.classSet).join(' ');
    }
}
