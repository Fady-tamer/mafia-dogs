// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCRJ_j_Se3PdOYTPCt3wjXwbZpFR6ycYIw",
  authDomain: "dogs-website-gallary.firebaseapp.com",
  projectId: "dogs-website-gallary",
  storageBucket: "dogs-website-gallary.firebasestorage.app",
  messagingSenderId: "501768654577",
  appId: "1:501768654577:web:e8185ea6eeb674a38a2350",
  measurementId: "G-YXSS75CN87"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const collectionName = "cards"; 

// --- 2. MODAL SETUP ---
if (!document.getElementById('card-modal')) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="card-modal" class="modal-overlay" onclick="closeCard(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close-modal-btn" onclick="closeCard(event)">
                    <i class="fa-solid fa-xmark"></i>
                </span>
                <div id="modal-body"></div>
            </div>
        </div>
    `);
}

const modalOverlay = document.getElementById('card-modal');
const modalBody = document.getElementById('modal-body');

// --- 3. LOGIC: Add Card Page (Updated for new Design) ---
const addForm = document.querySelector('.card-form'); 

if (addForm) {
    // A. Submit Logic
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = addForm.querySelector('button');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

        const fileInput = document.getElementById('card-img');
        const rawTitle = document.getElementById('card-header').value;
        const file = fileInput.files[0];

        if (!file) {
            alert("Please select an image!");
            submitBtn.disabled = false; 
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        try {
            const compressedImgString = await compressImage(file);
            const formattedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

            const newCard = {
                createdAt: Date.now(), 
                img: compressedImgString, 
                title: formattedTitle,
                desc: document.getElementById('card-description').value,
                category: document.getElementById('category').value,
            };

            await db.collection(collectionName).add(newCard);
            alert('Card Published Successfully!');
            window.location.reload();

        } catch (error) {
            console.error("Error:", error);
            alert("Error: " + error.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // B. File Upload Visual Logic (Shows filename on selection)
    const fileInput = document.getElementById('card-img');
    const fileVisualText = document.querySelector('.file-upload-visual span');
    const fileVisualIcon = document.querySelector('.file-upload-visual i');

    if (fileInput && fileVisualText) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileVisualText.textContent = this.files[0].name;
                fileVisualText.style.color = '#2F4156'; 
                fileVisualText.style.fontWeight = '600';
                
                if(fileVisualIcon) {
                    fileVisualIcon.className = 'fa-solid fa-check';
                    fileVisualIcon.style.color = '#567C8D'; 
                }
            }
        });
    }
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// --- 4. LOGIC: Index Page ---
document.getElementById('homeLink').addEventListener('click',()=>{
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})
document.getElementById('headerContent').addEventListener('click',()=>{
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})

const gridMap = {
    "general": document.querySelector('.general-grid'),
    "caucasian": document.querySelector('.caucasian-grid'),
    "alabai": document.querySelector('.alabai-grid'),
    "corso": document.querySelector('.corso-grid')
};

let allCardsCache = [];

if (document.querySelector('.general-grid')) {
    loadCards();
}

async function loadCards() {
    try {
        const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
        allCardsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGrids(allCardsCache);
    } catch (error) { console.error(error); }
}

function renderGrids(cardsToRender) {
    Object.values(gridMap).forEach(grid => { 
        if(grid) grid.innerHTML = ''; 
    });

    if (cardsToRender.length === 0) {
        return;
    }

    cardsToRender.forEach(card => {
        
        if(card.img && card.title && card.desc){
            var cardHTML = `
            <div class="card" onclick="openCard('${card.id}')">
                <div class="card-image"><img src="${card.img}" alt="${card.title}"></div>
                <div class="card-meta">
                    <span class="card-header">${card.title}</span>
                    <p class="card-description">${card.desc}</p>
                </div>
            </div>`;
        }else if(card.img && card.title){
            var cardHTML = `
            <div class="card" onclick="openCard('${card.id}')">
                <div class="card-image"><img src="${card.img}" alt="${card.title}"></div>
                <div class="card-meta">
                    <span class="card-header">${card.title}</span>
                </div>
            </div>`;
        }else if(card.img && card.desc){
            var cardHTML = `
            <div class="card" onclick="openCard('${card.id}')">
                <div class="card-image"><img src="${card.img}" alt="${card.title}"></div>
                <div class="card-meta">
                    <p class="card-description">${card.desc}</p>
                </div>
            </div>`;
        }else if(card.img){
            var cardHTML = `
            <div class="card" onclick="openCard('${card.id}')">
                <div class="card-image"><img src="${card.img}" alt="${card.title}"></div>
            </div>`;
        }
        
        const targetGrid = gridMap[card.category];
        
        if (targetGrid) {
            targetGrid.innerHTML += cardHTML;
        } 
    });
}

// --- 5. MODAL FUNCTIONS ---
window.openCard = function(cardId) {
    const card = allCardsCache.find(c => c.id === cardId);
    if (!card) return;
    
    modalBody.innerHTML = `
        <img src="${card.img}" alt="${card.title}">
        <div class="modal-header">
            <h2 style="font-size: 1.7rem;">${card.title}</h2>
        </div>
        <p style="font-size:1.1rem; line-height:1.7; color: white; white-space: pre-wrap; direction: rtl;">${card.desc}</p>
    `;

    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
};

window.closeCard = function(e) {
    if (e.target === modalOverlay || e.target.closest('.close-modal-btn')) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
};

// --- 6. DASHBOARD ACTIONS (Admin) ---
const dashboardBody = document.getElementById('dashboard-body');
if (dashboardBody) { loadDashboard(); }

async function loadDashboard() {
    dashboardBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
        const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dashboardBody.innerHTML = ''; 
        if (cards.length === 0) { dashboardBody.innerHTML = '<tr><td colspan="4">No cards found.</td></tr>'; return; }
        
        cards.forEach(card => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${card.img}" alt="img" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
                <td>${card.title}</td>
                <td>${card.category}</td>
                <td>
                    <button class="edit-btn" onclick="openEditModal('${card.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" onclick="deleteCard('${card.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            dashboardBody.appendChild(row);
        });
    } catch (e) { console.error(e); }
}

// --- 7. GLOBAL ACTIONS (Edit, Delete, Like, Rate) ---
window.openEditModal = async function(cardId) {
    try {
        const doc = await db.collection(collectionName).doc(cardId).get();
        if(!doc.exists) return alert("Card not found!");

        const card = doc.data();

        modalBody.innerHTML = `
            <h2 style="text-align:center; margin-bottom:15px; font-family:'Poppins', sans-serif;">تعديل</h2>
            <div class="edit-form" style="display:flex; flex-direction:column; gap:10px;">
                <label style="font-weight:600;">العنوان</label>
                <input type="text" id="edit-title" value="${card.title}" style="padding:8px; border:1px solid #ccc; border-radius:5px;">
                
                <label style="font-weight:600;">القسم</label>
                <select id="edit-category" style="padding:8px; border:1px solid #ccc; border-radius:5px;">
                    <option value="general" ${card.category === 'general' ? 'selected' : ''}>general</option>
                    <option value="caucasian" ${card.category === "caucasian" ? 'selected' : ''}>caucasian</option>
                    <option value="alabai" ${card.category === 'alabai' ? 'selected' : ''}>alabai</option>
                    <option value="corso" ${card.category === "corso" ? 'selected' : ''}>corso</option>
                </select>

                <label style="font-weight:600;">الوصف</label>
                <textarea id="edit-desc">${card.desc}</textarea>

                <button onclick="saveEdit('${cardId}')" style="margin:10px; padding:10px; background:var(--gold); color:white; border: 1px solid var(--dark-gold); border-radius:5px; cursor:pointer;">حفظ التغييرات</button>
            </div>
        `;
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 

    } catch(e) { console.error(e); alert("Error opening edit."); }
};

window.saveEdit = async function(cardId) {
    const newTitle = document.getElementById('edit-title').value;
    const newCategory = document.getElementById('edit-category').value;
    const newDesc = document.getElementById('edit-desc').value;

    try {
        await db.collection(collectionName).doc(cardId).update({
            title: newTitle,
            category: newCategory,
            desc: newDesc
        });
        
        alert("Saved!");
        modalOverlay.style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
        
        if(dashboardBody) loadDashboard();
        if(allCardsCache.length > 0) loadCards();

    } catch(e) {
        console.error(e);
        alert("Error saving: " + e.message);
    }
};

window.deleteCard = async function(docId) {
    if(confirm("Delete this card?")) {
        try { await db.collection(collectionName).doc(docId).delete(); loadDashboard(); } 
        catch (error) { alert("Error deleting"); }
    }
};

// --- 8. TRANSLATION SYSTEM (ALL PAGES) ---
const translations = {
    en: {
        nav_home: "Home",
        nav_add: "Add New",
        nav_contact: "Contact",
        
        // Index Page
        hero_title: "ELITE BLOODLINES",
        cat_general: "general",
        cat_caucasian: "caucasian",
        cat_alabai: "alabai",
        cat_corso: "corso",
        footer_text: "Copyright © 2026 MAFIA DOGS. All rights reserved.",
        
        // Add Card Page
        form_title: "Create New Card",
        txt_upload: "Click to upload image",
        lbl_title: "Card Title",
        lbl_cat: "Category",
        opt_select: "Select a category",
        lbl_desc: "Description",
        ph_desc: "Tell the story behind this card...",
        btn_publish: "Publish Card",
        
        // Dashboard
        dash_title: "Manage Content",
        dash_sub: "Edit or remove your portfolio items",
        btn_create: "Create New",
        th_art: "Artwork",
        th_det: "Details",
        th_cat: "Category",
        th_act: "Actions"
    },
    ar: {
        nav_home: "الرئيسية",
        nav_add: "إضافة جديد",
        nav_contact: "تواصل معنا",
        
        // Index Page
        hero_title: "سلالات النخبة",
        cat_general: "عام",
        cat_caucasian: "كوكيجن",
        cat_alabai: "ألاباي",
        cat_corso: "كاني كورسو",
        footer_text: "حقوق النشر © 2026 مافيا دوجز. جميع الحقوق محفوظة.",
        
        // Add Card Page
        form_title: "إضافة بطاقة جديدة",
        form_sub: "شارك فنك أو الفيديو الخاص بك مع العالم",
        lbl_img: "صورة البطاقة",
        txt_upload: "اضغط لرفع صورة",
        lbl_video: "رابط الفيديو (اختياري)",
        ph_video: "ضع رابط يوتيوب أو فيديو هنا...",
        hlp_video: "اتركه فارغاً إذا كانت بطاقة صور فقط.",
        lbl_title: "عنوان البطاقة",
        lbl_cat: "القسم",
        opt_select: "اختر قسماً",
        lbl_desc: "الوصف",
        ph_desc: "اكتب وصفاً للبطاقة...",
        btn_publish: "نشر البطاقة",
        
        // Dashboard
        dash_title: "إدارة المحتوى",
        dash_sub: "تعديل أو حذف المحتوى الخاص بك",
        btn_create: "إضافة جديد",
        th_art: "الصورة",
        th_det: "التفاصيل",
        th_cat: "القسم",
        th_act: "الإجراءات"
    }
};

let currentLang = localStorage.getItem('site_lang') || 'en';
applyLanguage(currentLang);

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('site_lang', currentLang);
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Handle Inputs having placeholders instead of textContent
            if(element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    const btn = document.getElementById('lang-btn');
    if(btn) btn.textContent = lang === 'en' ? 'AR' : 'EN';

    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.setAttribute('lang', 'en');
    }
}