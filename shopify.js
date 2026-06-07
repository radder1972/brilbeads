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
async function checkoutCart(customizerState, onSuccessCallback, shippingDetails = null) {
    if (!customizerState || !customizerState.placedBeads || customizerState.placedBeads.length === 0) {
        alert("Je winkelwagen is leeg!");
        return;
    }

    const properties = generateLineItemProperties(customizerState);

    // --- ECHTE SHOPIFY CHECKOUT ---
    if (isShopifyConfigured && shopifyClient) {
        try {
            console.log("Creating Shopify Checkout...", properties);
            
            // 1. Maak een checkout sessie aan
            let checkout = await shopifyClient.checkout.create();
            
            // 1b. Indien adresgegevens zijn meegeleverd (Route B), update de checkout
            if (shippingDetails) {
                try {
                    console.log("Pre-populating checkout email...", shippingDetails.email);
                    checkout = await shopifyClient.checkout.updateEmail(checkout.id, shippingDetails.email);
                } catch (emailErr) {
                    console.warn("Kon e-mailadres niet pre-populeren:", emailErr);
                }

                try {
                    console.log("Pre-populating checkout shipping address...", shippingDetails);
                    const shippingAddress = {
                        firstName: shippingDetails.firstName,
                        lastName: shippingDetails.lastName,
                        address1: `${shippingDetails.street} ${shippingDetails.number}`,
                        city: shippingDetails.city,
                        zip: shippingDetails.zip,
                        country: 'Netherlands'
                    };
                    checkout = await shopifyClient.checkout.updateShippingAddress(checkout.id, shippingAddress);
                } catch (addrErr) {
                    console.warn("Kon verzendadres niet pre-populeren:", addrErr);
                }
            }
            
            // 2. Formatteer de attributen voor de Shopify API
            const customAttributes = Object.entries(properties).map(([key, value]) => ({
                key,
                value: String(value)
            }));

            const lineItemsToAdd = [
                {
                    variantId: SHOPIFY_CONFIG.customGlassesVariantId,
                    quantity: 1,
                    customAttributes: customAttributes
                }
            ];

            // 3. Voeg de gepersonaliseerde bril toe aan de checkout
            const updatedCheckout = await shopifyClient.checkout.addLineItems(checkout.id, lineItemsToAdd);
            
            console.log("Shopify Checkout aangemaakt. Omleiden naar: ", updatedCheckout.webUrl);
            
            // 4. Stuur de klant door naar de Shopify Checkout pagina
            window.location.href = updatedCheckout.webUrl;
            
        } catch (error) {
            console.error("Fout tijdens het aanmaken van Shopify Checkout:", error);
            const useFallback = confirm(
                "❌ Shopify Verbindingsfout (401 Unauthorized of Netwerkfout).\n\n" +
                "Dit komt waarschijnlijk omdat de Shopify-winkel nog is beveiligd met een wachtwoord.\n\n" +
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
