/**
 * MODULE: StorageModule (Task 3)
 * Handles saving and loading cart from localStorage.
 */
export const StorageModule = {
    saveCart(cart) {
        try {
            localStorage.setItem('hamiCart', JSON.stringify(cart));
        } catch (e) {
            console.error("Could not save cart to localStorage", e);
        }
    },
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('hamiCart')) || [];
        } catch (e) {
            console.error("Could not load cart from localStorage", e);
            return [];
        }
    }
};