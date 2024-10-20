import type { Unsubscribe } from "@aldinh777/reactive/subscription";

export class Context {
    unsubscribers: Unsubscribe[] = [];
    onMount(mountHandler: () => void | Unsubscribe) {
        const dismountHandler = mountHandler();
        if (dismountHandler) {
            this.onDismount(dismountHandler);
        }
    }
    onDismount(dismountHandler: Unsubscribe) {
        this.unsubscribers.push(dismountHandler);
    }
    dismount(): void {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
}
