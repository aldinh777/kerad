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
