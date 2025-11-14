export const StorageModule = {
    //  Cart Functions 
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
    },
    
    //  (NEW) User Auth & Token Functions 
    saveUser(user) {
        try {
            localStorage.setItem('hamiUser', JSON.stringify(user));
        } catch (e) {
            console.error("Could not save user", e);
        }
    },
    loadUser() {
        try {
            return JSON.parse(localStorage.getItem('hamiUser')) || null;
        } catch (e) {
            console.error("Could not load user", e);
            return null;
        }
    },
    clearUser() {
        localStorage.removeItem('hamiUser');
    },
    
    saveToken(token) {
        try {
            localStorage.setItem('hamiToken', token);
        } catch (e) {
            console.error("Could not save token", e);
        }
    },
    loadToken() {
        try {
            return localStorage.getItem('hamiToken') || null;
        } catch (e) {
            console.error("Could not load token", e);
            return null;
        }
    },
    clearToken() {
        localStorage.removeItem('hamiToken');
    },

   
};