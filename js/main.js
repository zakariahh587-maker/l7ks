const SUPABASE_URL = 'https://exqmtppdpupkesbqrfic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sJIZxFReSHq31in0eSATXw_4l8a0oZZ';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
    let allProducts = [];

    async function init() {
        try {
            console.log('🔗 Connecting to Supabase...');
            if (typeof window.supabase === 'undefined') {
                console.error("❌ Supabase library missing");
                stopSyncing('Library error');
                return;
            }

            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            allProducts = data || [];
            console.log('📦 Products loaded:', allProducts.length);

            renderUI();
        } catch (error) {
            console.error('❌ Init Error:', error);
            stopSyncing('Sync error');
        }
    }

    function stopSyncing(msg) {
        const grids = ['featured-grid', 'shop-grid'];
        grids.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.innerText.includes('SYNCING')) {
                el.innerHTML = `<p style="text-align:center; padding: 50px; color: #666;">${msg}. Please refresh.</p>`;
            }
        });
    }

    function renderUI() {
        if (document.getElementById('featured-grid')) renderFeatured();
        if (document.getElementById('shop-grid')) renderShop(allProducts);
        if (document.getElementById('product-detail-page')) renderDetail();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function createCard(p) {
        const img = (p.images && p.images[0]) || 'https://via.placeholder.com/600x800';
        return `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor: pointer;">
                <div class="product-img">
                    <img src="${img}" alt="${p.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="product-price">${parseFloat(p.price || 0).toFixed(2)} MAD</div>
                </div>
            </div>
        `;
    }

    function renderFeatured() {
        const grid = document.getElementById('featured-grid');
        if (!grid) return;
        const items = allProducts.slice(0, 4);
        grid.innerHTML = items.length ? items.map(p => createCard(p)).join('') : '<p style="padding:40px; text-align:center;">Catalog is empty.</p>';
    }

    function renderShop(toRender) {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;
        grid.innerHTML = toRender.length ? toRender.map(p => createCard(p)).join('') : '<p style="padding:40px; text-align:center;">No items found.</p>';
    }

    function renderDetail() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = allProducts.find(p => String(p.id) === String(productId));
        if (!product) return;

        document.title = `${product.name} | L7K OFFICEL`;
        if (document.getElementById('pd-name')) document.getElementById('pd-name').innerText = product.name;
        if (document.getElementById('pd-price')) document.getElementById('pd-price').innerText = `${parseFloat(product.price || 0).toFixed(2)} MAD`;
        if (document.getElementById('pd-desc')) document.getElementById('pd-desc').innerText = product.description;

        const imgs = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/600x800'];
        const main = document.getElementById('pd-main-img');
        if (main) main.innerHTML = `<img src="${imgs[0]}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`;

        const sizesContainer = document.getElementById('pd-sizes');
        if (sizesContainer && product.sizes) {
            sizesContainer.innerHTML = product.sizes.map(s => `
                <div style="border: 1px solid #333; padding: 10px 20px; cursor: pointer; font-size: 0.8rem; font-weight: 900; transition: 0.3s; color: #fff;" onclick="window.selectSize(this)">${s}</div>
            `).join('');
        }
    }

    window.selectSize = (el) => {
        document.querySelectorAll('#pd-sizes > div').forEach(s => {
            s.style.background = 'transparent';
            s.style.borderColor = '#333';
            s.style.color = '#fff';
        });
        el.style.borderColor = '#fff';
        el.style.background = '#fff';
        el.style.color = '#000';
    };

    window.addToCartFromPD = () => {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = allProducts.find(p => String(p.id) === String(productId));
        // Check for the one with white background (selected)
        const selectedSizeEl = Array.from(document.querySelectorAll('#pd-sizes div')).find(el => el.style.background === 'rgb(255, 255, 255)' || el.style.background === 'white');

        if (!selectedSizeEl) {
            alert('Veuillez sélectionner une taille.');
            return;
        }

        if (product) {
            window.addToCart(product, selectedSizeEl.innerText);
        }
    };

    // CART SYSTEM
    window.cart = JSON.parse(localStorage.getItem('L7K_CART')) || [];
    window.shippingPrice = 30;

    window.toggleCart = () => {
        const overlay = document.getElementById('cartOverlay');
        if (!overlay) return;
        overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
        renderCart();
    };

    window.addToCart = (product, size) => {
        const existing = window.cart.find(item => item.id === product.id && item.size === size);
        if (existing) {
            existing.qty += 1;
        } else {
            window.cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                img: (product.images && product.images[0]) || 'https://via.placeholder.com/100',
                size: size,
                qty: 1
            });
        }
        localStorage.setItem('L7K_CART', JSON.stringify(window.cart));
        window.toggleCart();
    };

    window.removeFromCart = (index) => {
        window.cart.splice(index, 1);
        localStorage.setItem('L7K_CART', JSON.stringify(window.cart));
        renderCart();
    };

    window.setShipping = (price, el) => {
        window.shippingPrice = price;
        document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
        updateTotals();
    };

    function renderCart() {
        const itemsList = document.getElementById('cartItems');
        if (!itemsList) return;

        if (window.cart.length === 0) {
            itemsList.innerHTML = '<p style="text-align:center; padding: 40px 0; color: #888;">Votre panier est vide.</p>';
            updateTotals();
            return;
        }

        itemsList.innerHTML = window.cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-qty">${item.qty}</div>
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}</p>
                    <div class="cart-item-price">Dh ${item.price.toFixed(2)} MAD</div>
                </div>
                <div class="cart-item-remove" onclick="window.removeFromCart(${index})">&times;</div>
            </div>
        `).join('');
        updateTotals();
    }

    function updateTotals() {
        const subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const total = subtotal + window.shippingPrice;

        if (document.getElementById('cartSubtotal')) document.getElementById('cartSubtotal').innerText = `Dh ${subtotal.toFixed(2)} MAD`;
        if (document.getElementById('cartShipping')) document.getElementById('cartShipping').innerText = `Dh ${window.shippingPrice.toFixed(2)} MAD`;
        if (document.getElementById('cartTotal')) document.getElementById('cartTotal').innerText = `Dh ${total.toFixed(2)} MAD`;
        if (document.getElementById('checkoutBtn')) document.getElementById('checkoutBtn').innerText = `ACHETER MAINTENANT - Dh ${total.toFixed(2)} MAD`;
    }

    window.processOrder = async () => {
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const city = document.getElementById('orderCity').value;
        const address = document.getElementById('orderAddress').value;

        if (!name || !phone || !city || !address) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const btn = document.getElementById('checkoutBtn');
        btn.innerText = 'ENVOI EN COURS...';
        btn.disabled = true;

        const subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const total = subtotal + window.shippingPrice;

        const orderData = {
            customer_name: name,
            customer_phone: phone,
            customer_city: city,
            customer_address: address,
            items: window.cart,
            total: total,
            status: 'pending'
        };

        try {
            // Failsafe: Re-init client if undefined
            if (!supabase && typeof window.supabase !== 'undefined') {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            }

            console.log('📤 Sending order to Supabase:', orderData);
            const { error } = await supabase.from('orders').insert([orderData]);

            if (error) {
                console.error('❌ Supabase Order Error:', error);
                throw error;
            }

            showSuccess();
            window.cart = [];
            localStorage.removeItem('L7K_CART');
        } catch (error) {
            console.error('Order Error:', error);
            alert('Erreur: ' + (error.message || 'Problème de connexion au serveur.'));
            btn.innerText = `ACHETER MAINTENANT - Dh ${total.toFixed(2)} MAD`;
            btn.disabled = false;
        }
    };

    function showSuccess() {
        // Create overlay if not exists
        let overlay = document.getElementById('successOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'successOverlay';
            overlay.className = 'success-overlay';
            overlay.innerHTML = `
                <div class="success-content">
                    <div class="success-icon"><i data-lucide="check"></i></div>
                    <h2 class="success-title">THANK YOU</h2>
                    <p class="success-msg">Merci pour votre commande ! Nous vous contacterons bientôt.</p>
                    <button class="btn-success" onclick="window.location.href='index.html'">RETOUR À L'ACCUEIL</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    init();
});
