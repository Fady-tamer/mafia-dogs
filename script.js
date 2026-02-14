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
// Inject Modal HTML if it doesn't exist
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
            window.location.reload(); // Optional: reload to clear form

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
const gridMap = {
    "general": document.querySelector('.general-grid'),
    "caucasian": document.querySelector('.caucasian-grid'),
    "alabai": document.querySelector('.alabai-grid'),
    "corso": document.querySelector('.corso-grid')
};

// GLOBAL VARIABLE FOR CACHE
let allCardsCache = [];

// CRITICAL FIX: Trigger load if on homepage
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
    // Clear all grids first
    Object.values(gridMap).forEach(grid => { 
        if(grid) grid.innerHTML = ''; 
    });

    if (cardsToRender.length === 0) {
        return;
    }

    cardsToRender.forEach(card => {
        const cardHTML = `
        <div class="card" onclick="openCard('${card.id}')">
            <div class="card-image"><img src="${card.img}" alt="${card.title}" loading="lazy"></div>
            <div class="card-meta">
                <span class="card-header">${card.title}</span>
                <p class="card-description">${card.desc}</p>
            </div>
        </div>`;
        
        // Find specific grid for this category
        const targetGrid = gridMap[card.category];
        
        // Only append if the grid actually exists in HTML
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
            <h2 style="font-size:2.5rem; color:var(--navy);">${card.title}</h2>
        </div>
        <p style="font-size:1.05rem; line-height:1.7; color:#444; white-space: pre-wrap;">${card.desc}</p>
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

        // Inject Form into Modal
        modalBody.innerHTML = `
            <h2 style="text-align:center; margin-bottom:15px; font-family:'Poppins', sans-serif;">Edit Card</h2>
            <div class="edit-form" style="display:flex; flex-direction:column; gap:10px;">
                <label style="font-weight:600;">Title</label>
                <input type="text" id="edit-title" value="${card.title}" style="padding:8px; border:1px solid #ccc; border-radius:5px;">
                
                <label style="font-weight:600;">Category</label>
                <select id="edit-category" style="padding:8px; border:1px solid #ccc; border-radius:5px;">
                    <option value="general" ${card.category === 'general' ? 'selected' : ''}>general</option>
                    <option value="caucasian" ${card.category === "caucasian" ? 'selected' : ''}>caucasian</option>
                    <option value="alabai" ${card.category === 'alabai' ? 'selected' : ''}>alabai</option>
                    <option value="corso" ${card.category === "corso" ? 'selected' : ''}>corso</option>
                </select>

                <label style="font-weight:600;">Description</label>
                <textarea id="edit-desc" rows="5" style="padding:8px; border:1px solid #ccc; border-radius:5px;">${card.desc}</textarea>

                <button onclick="saveEdit('${cardId}')" style="margin-top:10px; padding:10px; background:var(--teal); color:white; border:none; border-radius:5px; cursor:pointer;">Save Changes</button>
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
        
        // Refresh appropriate view
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