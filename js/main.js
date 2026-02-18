import { db } from './firebase-config.js';
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    let allProducts = [];

    async function loadProducts() {
        try {
            console.log('🔗 Connecting to Realtime Database...');
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `products`));

            if (snapshot.exists()) {
                const data = snapshot.val();
                // Realtime DB stores objects, we need to convert to array
                allProducts = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                console.log('📦 Loaded ' + allProducts.length + ' products');
            } else {
                console.log("No data available");
            }

            if (document.getElementById('featured-grid')) renderFeaturedProducts();
            if (document.getElementById('shop-grid')) renderShopProducts(allProducts);
            if (document.getElementById('product-detail-page')) renderProductDetail();

        } catch (error) {
            console.error('❌ Error:', error);
        }
    }

    // (The rest of your rendering functions remain the same as they use the allProducts array)
    function renderFeaturedProducts() {
        const featuredGrid = document.getElementById('featured-grid');
        if (!featuredGrid) return;
        const featured = allProducts.filter(p => p.featured).slice(0, 4);
        featuredGrid.innerHTML = featured.map(p => createProductCard(p)).join('');
        lucide.createIcons();
    }

    function renderShopProducts(productsToRender) {
        const shopGrid = document.getElementById('shop-grid');
        if (!shopGrid) return;
        shopGrid.innerHTML = productsToRender.map(p => createProductCard(p)).join('');
        lucide.createIcons();
    }

    function createProductCard(product) {
        const mainImg = Array.isArray(product.images) ? product.images[0] : (product.mainImage || 'https://via.placeholder.com/400x500');
        const hoverImg = Array.isArray(product.images) && product.images[1] ? product.images[1] : (product.hoverImage || '');
        return `
            <div class="product-card" data-id="${product.id}" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
                <div class="product-img">
                    <img src="${mainImg}" alt="${product.name}" class="main-img">
                    ${hoverImg ? `<img src="${hoverImg}" alt="${product.name}" class="hover-img">` : ''}
                    ${product.badge ? `<div class="product-badge ${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</div>` : ''}
                    <button class="add-to-cart-quick" onclick="event.stopPropagation(); showNotification('${product.name} added to cart')">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${parseFloat(product.price || 0).toFixed(2)}</p>
                    <div class="product-options">
                        ${product.sizes ? product.sizes.map(s => `<span>${s}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function renderProductDetail() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        document.title = `${product.name} | L7K Officiel`;
        document.getElementById('pd-name').innerText = product.name;
        document.getElementById('pd-price').innerText = `$${parseFloat(product.price || 0).toFixed(2)}`;
        document.getElementById('pd-desc').innerText = product.description;
        document.getElementById('pd-breadcrumb').innerText = `Shop / ${product.category} / ${product.name}`;

        const detailsList = document.getElementById('pd-details');
        if (product.details) detailsList.innerHTML = product.details.map(d => `• ${d}<br>`).join('');

        const imgs = Array.isArray(product.images) ? product.images : [product.mainImage, product.hoverImage].filter(Boolean);
        document.getElementById('pd-main-img').innerHTML = `<img src="${imgs[0]}" alt="${product.name}">`;
        document.getElementById('pd-thumbs').innerHTML = imgs.map((img, index) => `
            <img src="${img}" alt="Thumb" class="${index === 0 ? 'active' : ''}" onclick="window.updatePDMainImage(this, '${img}')">
        `).join('');

        if (product.sizes) {
            document.getElementById('pd-sizes').innerHTML = product.sizes.map(s => `
                <div class="size-box" onclick="window.selectSize(this)">${s}</div>
            `).join('');
        }
    }

    window.updatePDMainImage = (el, src) => {
        document.querySelector('#pd-main-img img').src = src;
        document.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    };
    window.selectSize = (el) => {
        document.querySelectorAll('.size-box').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
    };
    window.showNotification = (msg) => {
        const notif = document.createElement('div');
        notif.style.cssText = `position:fixed;top:20px;right:20px;background:#000;color:#fff;padding:15px 25px;border-radius:4px;z-index:9999;font-weight:600;box-shadow:0 4px 15px rgba(0,0,0,0.2);`;
        notif.innerText = msg; document.body.appendChild(notif); setTimeout(() => notif.remove(), 3000);
    };

    loadProducts();
});
