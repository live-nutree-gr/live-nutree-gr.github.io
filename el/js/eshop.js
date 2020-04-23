(function () {
    const STORAGE_KEY = 'nutree-storage';

    window.NutreeJS = {
        products: {
            orangeCarob: {
                "id":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzAyMDMyODk2NjE=",
                "title":
                    "Orange Carob",
                "defaultVariantId":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY0OTI3OTkwMTc1Nw=="
            },
            matcha: {
                "id":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzAyMDQxMDg4NjE=",
                "title":
                    "Matcha",
                "defaultVariantId":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY0OTI4NzgzMTYxMw=="
            },
            strawberryPraline: {
                "id":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzAyMDQ4NjI1MjU=",
                "title":
                    "Strawberry Praline",
                "defaultVariantId":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY0OTI5NDA1NzUzMw=="
            },
            peanutButter: {
                "id":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzAyMDUxMjQ2Njk=",
                "title":
                    "Peanut Butter",
                "defaultVariantId":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY0OTI5NjIyMDIyMQ=="
            },
            appleCinnamon: {
                "id":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzAyMDU4NzgzMzM=",
                "title":
                    "Apple Cinnamon",
                "defaultVariantId":
                    "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY0OTMwNDgzODIwNQ=="
            }
        },

        boxes: {
            smallBox: {
                id: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzQ4NjAyMTIyODU=",
                title: "Small Box",
                defaultVariantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY2NjczNDU2MzM4OQ==",
                totalBars: 12
            },
            mediumBox: {
                id: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzQ4NjAzNDMzNTc=",
                title: "Medium Box",
                defaultVariantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY2NjczNTY3NzUwMQ==",
                totalBars: 24
            },
            largeBox: {
                id: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ0MzQ4NjA1MDcxOTc=",
                title: "Large Box",
                defaultVariantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMTY2NjczNjg1NzE0OQ==",
                totalBars: 48
            }
        },

        client: ShopifyBuy.buildClient({
            domain: 'nutree-gr.myshopify.com',
            storefrontAccessToken: 'fab1e265e769f8b66acfa92826832e78'
        }),

        getStorage: () => {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        },

        getBarLimit: () => {
            return NutreeJS.boxes[NutreeJS.getStorage().selectedBox].totalBars;
        },

        getRemainingBars: () => {
            let barCount = 0;
            try {
                let barNames = Object.keys(NutreeJS.products);
                barCount = barNames.reduce((total, bar) => {
                    return total + (NutreeJS.getStorage().selectedBars[bar] || 0);
                }, 0);
            } catch (ignore) {
            }

            return NutreeJS.getBarLimit() - barCount;
        },

        store: (o) => {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            jQuery.extend(true, stored, o);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            return stored;
        },

        initCheckout: () => {
            let storage = NutreeJS.getStorage();
            if (!storage.checkoutId) {
                console.debug("creating new shopify checkout cart");
                NutreeJS.checkout = NutreeJS.client.checkout.create();
                NutreeJS.checkout.then(c => {
                    storage.checkoutId = c.id;
                    NutreeJS.store(storage);
                });
            } else {
                console.debug("fetching existing shopify checkout cart");
                NutreeJS.checkout = NutreeJS.client.checkout.fetch(storage.checkoutId);
            }
            return NutreeJS.checkout;
        },

        init: (config) => {
            addEventListener('storage', function (e) {
                if (e.key !== STORAGE_KEY || e.newValue === e.oldValue) {
                    return;
                }
                console.debug(e.newValue);
                localStorage.setItem(STORAGE_KEY, e.newValue);
                (config.storageSyncCallback || function () {
                })();
            });

            NutreeJS.initCheckout().then(c => {
                console.debug(c);
                if (!!c.completedAt) {
                    console.debug("resetting shopify checkout cart");
                    let storage = NutreeJS.getStorage();
                    storage.checkoutId = null;
                    NutreeJS.initCheckout();
                }
            }).catch(error => {
                console.error(error);
                NutreeJS.initCheckout();
            })
        }
    };
})();