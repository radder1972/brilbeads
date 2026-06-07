/**
 * BRIL BEADS - SHOPIFY INTEGRATION ENGINE
 * 
 * Deze module koppelt de lokale configurator/winkelwagen aan de Shopify Storefront API.
 * Als er nog geen geldige Shopify-credentials zijn ingevuld, draait de code in
 * DEMO/SIMULATIE-modus zodat de webshop-stappen lokaal getest kunnen worden.
 */

const SHOPIFY_CONFIG = {
    shopDomain: 'b41z1g-vq.myshopify.com', // Jouw Shopify-winkelnaam
    storefrontAccessToken: '750cd9d0f633c4450b489b8d7d9759cf', // Shopify Storefront API Access Token (Headless)
    customGlassesVariantId: 'gid://shopify/ProductVariant/53980035481937' // Shopify Product Variant ID voor de Custom Bril
};

// Controleer of de configuratie is ingevuld met echte gegevens
const isShopifyConfigured = 
    SHOPIFY_CONFIG.storefrontAccessToken !== 'YOUR_STOREFRONT_ACCESS_TOKEN';

let shopifyClient = null;

// Initialiseer de Shopify Buy Client indien geconfigureerd
if (isShopifyConfigured && typeof ShopifyBuy !== 'undefined') {
    try {
        shopifyClient = ShopifyBuy.buildClient({
            domain: SHOPIFY_CONFIG.shopDomain,
            storefrontAccessToken: SHOPIFY_CONFIG.storefrontAccessToken,
            apiVersion: '2024-04'
        });
        console.log("🛒 Shopify Buy Client succesvol geïnitialiseerd.");
    } catch (e) {
        console.error("❌ Fout bij het laden van de Shopify Buy Client:", e);
    }
} else {
    console.warn("⚠️ Shopify is niet geconfigureerd of de Shopify SDK is niet geladen. Bestelsysteem draait in SIMULATIE-modus.");
}

/**
 * Genereert de line-item properties voor de custom bril
 * @param {Object} state De customizer state uit localStorage
 * @returns {Object} Een object met alle ontwerpdetails
 */
function generateLineItemProperties(state) {
    const beadListText = state.placedBeads.map(b => b.name).join(', ');
    const properties = {
        'Montuur Type': state.targetAudience === 'kids' ? 'Kids' : 'Volwassenen',
        'Montuur Kleur': state.frameColor.charAt(0).toUpperCase() + state.frameColor.slice(1),
        'Bevestiging': state.attachmentMethod === 'slide' ? 'Siliconen Ring' : 'Klik Clip',
        'Totaal Aantal Beads': String(state.placedBeads.length),
        'Gekozen Beads': beadListText || 'Geen beads geplaatst'
    };

    // Voeg exacte posities van de beads toe voor productie
    state.placedBeads.forEach((bead, index) => {
        properties[`Bead ${index + 1}`] = `${bead.name} (X: ${Math.round(bead.x)}, Y: ${Math.round(bead.y)})`;
    });

    return properties;
}

/**
 * Start het afrekenproces. 
 * Als Shopify is geconfigureerd wordt een checkout aangemaakt en de gebruiker omgeleid.
 * Zo niet, dan wordt de bestelling lokaal gesimuleerd.
 * 
 * @param {Object} customizerState De ontwerp-state uit localStorage
 * @param {Function} onSuccessCallback Optionele callback bij simulatie-succes
 */
async function executeGraphQL(query, variables = {}) {
    const url = `https://${SHOPIFY_CONFIG.shopDomain}/api/2024-04/graphql`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
        throw new Error(json.errors.map(e => e.message).join(', '));
    }

    return json.data;
}

async function fetchShopifyBeads() {
    if (!isShopifyConfigured) {
        console.warn("⚠️ Shopify is niet geconfigureerd. Dynamisch inladen van beads is overgeslagen.");
        return [];
    }

    const query = `
        query getBeads {
          products(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
    `;

    try {
        console.log("Fetching beads from Shopify Storefront API...");
        const data = await executeGraphQL(query);
        const products = data.products.edges.map(edge => {
            const node = edge.node;
            const variantNode = node.variants.edges[0]?.node;
            return {
                title: node.title,
                available: node.availableForSale,
                variantId: variantNode ? variantNode.id : null,
                price: variantNode ? parseFloat(variantNode.price.amount) : 0
            };
        });
        console.log("Successfully fetched beads from Shopify:", products);
        return products;
    } catch (e) {
        console.error("❌ Fout bij het ophalen van beads uit Shopify:", e);
        return [];
    }
}

async function checkoutCart(customizerState, onSuccessCallback, shippingDetails = null) {
    if (!customizerState || !customizerState.placedBeads || customizerState.placedBeads.length === 0) {
        alert("Je winkelwagen is leeg!");
        return;
    }

    const properties = generateLineItemProperties(customizerState);

    // --- ECHTE SHOPIFY CHECKOUT VIA CART API ---
    if (isShopifyConfigured) {
        try {
            console.log("Creating Shopify Cart via Cart API...", properties);

            // Formatteer de attributen voor de Shopify Cart Line Items
            const customAttributes = Object.entries(properties).map(([key, value]) => ({
                key,
                value: String(value)
            }));

            // Bepaal de hoofd-merchandise variant ID voor de customizer eigenschappen.
            // We gebruiken de variant ID van de eerste geplaatste bead die een geldige Shopify ID heeft.
            // Als er geen beads met een geldige ID zijn, vallen we terug op de geconfigureerde customGlassesVariantId.
            let mainVariantId = SHOPIFY_CONFIG.customGlassesVariantId;
            const firstBeadWithVariant = customizerState.placedBeads.find(b => b.variantId);
            if (firstBeadWithVariant) {
                mainVariantId = firstBeadWithVariant.variantId;
            }

            // Bereid de CartInput voor met de hoofdlijn die alle attributes bevat
            const lines = [
                {
                    quantity: 1,
                    merchandiseId: mainVariantId,
                    attributes: customAttributes
                }
            ];

            // Gropeer geplaatste beads per Variant ID om ze als losse items toe te voegen
            const beadCounts = {};
            customizerState.placedBeads.forEach(bead => {
                if (bead.variantId) {
                    beadCounts[bead.variantId] = (beadCounts[bead.variantId] || 0) + 1;
                }
            });

            // Omdat we al 1x mainVariantId hebben toegevoegd als de hoofdlijn,
            // trekken we er hier 1 vanaf als die in de beadCounts zit.
            if (beadCounts[mainVariantId]) {
                beadCounts[mainVariantId]--;
            }

            // Voeg de overige beads toe aan de winkelwagen
            for (const [variantId, quantity] of Object.entries(beadCounts)) {
                if (quantity > 0) {
                    lines.push({
                        quantity: quantity,
                        merchandiseId: variantId
                    });
                }
            }

            const cartInput = { lines };

            // Voeg optioneel de koperinformatie toe (Route B)
            if (shippingDetails && shippingDetails.email) {
                const trimmedEmail = shippingDetails.email.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (emailRegex.test(trimmedEmail)) {
                    cartInput.buyerIdentity = {
                        email: trimmedEmail,
                        countryCode: 'NL',
                        deliveryAddressPreferences: [
                            {
                                deliveryAddress: {
                                    firstName: shippingDetails.firstName ? shippingDetails.firstName.trim() : '',
                                    lastName: shippingDetails.lastName ? shippingDetails.lastName.trim() : '',
                                    address1: `${shippingDetails.street} ${shippingDetails.number}`.trim(),
                                    city: shippingDetails.city ? shippingDetails.city.trim() : '',
                                    zip: shippingDetails.zip ? shippingDetails.zip.trim() : '',
                                    country: 'Netherlands'
                                }
                            }
                        ]
                    };
                } else {
                    console.warn("E-mailadres is ongeldig voor Shopify validation, overslaan van pre-populatie.");
                }
            }

            const mutation = `
                mutation cartCreate($input: CartInput!) {
                  cartCreate(input: $input) {
                    cart {
                      id
                      checkoutUrl
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
            `;

            const data = await executeGraphQL(mutation, { input: cartInput });

            if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
                const errors = data.cartCreate.userErrors.map(e => `${e.field}: ${e.message}`).join(', ');
                throw new Error(`Shopify UserErrors: ${errors}`);
            }

            const checkoutUrl = data.cartCreate.cart.checkoutUrl;
            console.log("Shopify Checkout URL verkregen via Cart API. Omleiden naar: ", checkoutUrl);
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error("Fout tijdens het aanmaken van Shopify Cart/Checkout:", error);
            const useFallback = confirm(
                "❌ Shopify Verbindingsfout.\n\n" +
                "Er is een fout opgetreden bij het verbinden met Shopify.\n\n" +
                "Wil je de bestelling in SIMULATIE-modus afronden om de rest van de website te testen?"
            );
            if (useFallback && onSuccessCallback) {
                onSuccessCallback();
            }
        }
    } 
    // --- SIMULATIE MODUS ---
    else {
        console.log("=== SHOPIFY SIMULATION CHECKOUT ===");
        console.log("Shopify Domain:", SHOPIFY_CONFIG.shopDomain);
        console.log("Variant ID:", SHOPIFY_CONFIG.customGlassesVariantId);
        console.log("Verzamelde Line Item Properties die naar Shopify gestuurd zouden worden:", properties);
        console.log("===================================");

        // Toon een duidelijke melding aan de ontwikkelaar/gebruiker
        alert(
            `🎉 [Simulatie Mode] Shopify Checkout Gestart!\n\n` +
            `Jouw ontwerp is succesvol omgezet naar Shopify Line Item Properties:\n` +
            `- Montuur: ${properties['Montuur Kleur']} (${properties['Montuur Type']})\n` +
            `- Bevestiging: ${properties['Bevestiging']}\n` +
            `- Beads: ${properties['Gekozen Beads']}\n\n` +
            `Vul echte credentials in shopify.js in om verbinding te maken met je Shopify-winkel.`
        );

        if (onSuccessCallback) {
            onSuccessCallback();
        }
    }
}

/**
 * Haalt alle Shopify producten op ten behoeve van een catalogus/overzichtspagina.
 * Inclusief afbeeldingen en omschrijvingen.
 */
async function fetchShopifyProductsForGallery() {
    if (!isShopifyConfigured) {
        console.warn("⚠️ Shopify is niet geconfigureerd. Producten laden gesimuleerd.");
        return getMockProducts();
    }

    const query = `
        query getProductsForGallery {
          products(first: 50) {
            edges {
              node {
                id
                title
                description
                availableForSale
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
    `;

    try {
        console.log("Fetching gallery products from Shopify Storefront API...");
        const data = await executeGraphQL(query);
        const products = data.products.edges.map(edge => {
            const node = edge.node;
            const variantNode = node.variants.edges[0]?.node;
            
            const imageEdges = node.images.edges;
            const images = imageEdges.map(e => ({
                url: e.node.url,
                altText: e.node.altText || node.title
            }));
            
            if (images.length === 0) {
                images.push({
                    url: 'assets/logo.png?v=2',
                    altText: node.title
                });
            }
            
            // Fallback beschrijvingen voor betere uitstraling
            let description = node.description;
            if (!description || description.trim() === '') {
                if (node.title.toLowerCase().includes('kitty')) {
                    description = "De vrolijke Hello Kitty bead voor je bril. Gemaakt van zacht en duurzaam materiaal.";
                } else if (node.title.toLowerCase().includes('superman')) {
                    description = "De coole 3D Superman bead. Geef je bril superkrachten met dit coole logo bedeltje.";
                } else if (node.title.toLowerCase().includes('bart')) {
                    description = "De grappige spikkel-bedel van Bart Simpson. Perfect voor een speelse en opvallende look.";
                } else if (node.title.toLowerCase().includes('dora')) {
                    description = "De avontuurlijke Dora Explorer bead. Ga op ontdekkingsreis met dit supervrolijke en kleurrijke bedeltje voor je bril!";
                } else {
                    description = "Een vrolijke en unieke Bril Bead om je bril helemaal zelf mee op te pimpen!";
                }
            }

            return {
                id: node.id,
                title: node.title,
                description: description,
                available: node.availableForSale,
                images: images,
                imageUrl: images[0].url,
                imageAlt: images[0].altText,
                variantId: variantNode ? variantNode.id : null,
                price: variantNode ? parseFloat(variantNode.price.amount) : 0,
                currency: variantNode ? variantNode.price.currencyCode : 'EUR'
            };
        });
        console.log("Successfully fetched products for gallery:", products);
        return products;
    } catch (e) {
        console.error("❌ Fout bij het ophalen van producten uit Shopify voor de gallerij:", e);
        return getMockProducts(); // Fallback naar mock bij API-fouten
    }
}

function getMockProducts() {
    return [
        {
            id: 'mock-kitty',
            title: 'Bril Bead KITTY',
            description: 'De vrolijke Hello Kitty bead voor je bril. Gemaakt van zacht en duurzaam materiaal.',
            available: true,
            images: [
                { url: 'assets/hero_photo_pink_kitty.png', altText: 'Bril Bead Kitty Roze' },
                { url: 'assets/hero_photo_blue_kitty.png', altText: 'Bril Bead Kitty Blauw' },
                { url: 'assets/logo.png?v=2', altText: 'Bril Beads Logo' }
            ],
            imageUrl: 'assets/hero_photo_pink_kitty.png',
            imageAlt: 'Bril Bead Kitty',
            variantId: 'gid://shopify/ProductVariant/53980035481937',
            price: 5.00,
            currency: 'EUR'
        },
        {
            id: 'mock-superman',
            title: 'Bril Bead SUPERMAN 3D',
            description: 'De stoere 3D Superman bead. Geef je bril superkrachten met dit coole logo bedeltje.',
            available: true,
            images: [
                { url: 'assets/hero_photo_boy_superman_close.png', altText: 'Bril Bead Superman 3D Detail' },
                { url: 'assets/hero_photo_boy_superman.png', altText: 'Bril Bead Superman 3D' },
                { url: 'assets/logo.png?v=2', altText: 'Bril Beads Logo' }
            ],
            imageUrl: 'assets/hero_photo_boy_superman_close.png',
            imageAlt: 'Bril Bead Superman 3D',
            variantId: 'gid://shopify/ProductVariant/53980223504721',
            price: 5.00,
            currency: 'EUR'
        },
        {
            id: 'mock-bart',
            title: 'Bril Bead BART',
            description: 'De grappige spikkel-bedel van Bart Simpson. Perfect voor een speelse en opvallende look.',
            available: true,
            images: [
                { url: 'assets/hero_photo_green_bart.png', altText: 'Bril Bead Bart Simpson' },
                { url: 'assets/logo.png?v=2', altText: 'Bril Beads Logo' }
            ],
            imageUrl: 'assets/hero_photo_green_bart.png',
            imageAlt: 'Bril Bead Bart',
            variantId: 'gid://shopify/ProductVariant/53981153231185',
            price: 5.00,
            currency: 'EUR'
        },
        {
            id: 'mock-dora',
            title: 'Bril Bead DORA',
            description: 'De avontuurlijke Dora Explorer bead. Ga op ontdekkingsreis met dit supervrolijke en kleurrijke bedeltje voor je bril!',
            available: true,
            images: [
                { url: 'assets/hero_photo_dora.png', altText: 'Bril Bead Dora Explorer' },
                { url: 'assets/logo.png?v=2', altText: 'Bril Beads Logo' }
            ],
            imageUrl: 'assets/hero_photo_dora.png',
            imageAlt: 'Bril Bead Dora',
            variantId: 'gid://shopify/ProductVariant/53982000000000',
            price: 5.00,
            currency: 'EUR'
        }
    ];
}

/**
 * Direct checkout voor een specifiek product (bead) via de Cart API.
 * @param {string} variantId De Shopify Product Variant ID
 * @param {string} title De titel van het product
 */
async function orderProductDirect(variantId, title) {
    if (!variantId) {
        alert("Dit product kan momenteel niet direct besteld worden (geen Shopify Variant ID).");
        return;
    }

    if (isShopifyConfigured) {
        try {
            console.log(`Direct checkout gestart voor ${title} (${variantId})`);
            const cartInput = {
                lines: [
                    {
                        quantity: 1,
                        merchandiseId: variantId
                    }
                ]
            };
            const mutation = `
                mutation cartCreate($input: CartInput!) {
                  cartCreate(input: $input) {
                    cart {
                      id
                      checkoutUrl
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
            `;
            const data = await executeGraphQL(mutation, { input: cartInput });
            if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
                const errors = data.cartCreate.userErrors.map(e => `${e.field}: ${e.message}`).join(', ');
                throw new Error(`Shopify UserErrors: ${errors}`);
            }
            const checkoutUrl = data.cartCreate.cart.checkoutUrl;
            console.log("Direct checkout URL verkregen via Cart API. Omleiden naar: ", checkoutUrl);
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error("Fout tijdens direct checkout:", error);
            alert("Er is een fout opgetreden bij het verbinden met Shopify voor direct bestellen.");
        }
    } else {
        console.log("=== SHOPIFY SIMULATION DIRECT BUY ===");
        console.log("Product:", title);
        console.log("Variant ID:", variantId);
        console.log("=====================================");
        alert(
            `🎉 [Simulatie Mode] Shopify Direct Bestellen Gestart!\n\n` +
            `Product: ${title}\n` +
            `Variant ID: ${variantId}\n\n` +
            `Vul echte credentials in shopify.js in om verbinding te maken met je Shopify-winkel.`
        );
    }
}

