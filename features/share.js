/* features/share.js - Gallery, Download & Share Logic */

window.JewelsShare = (function() {
    
    // State to hold photos
    let collection = []; 
    let currentPreview = null; // { url, name }

    /* --- 1. PREVIEW & SHARE --- */
    function openPreview(data) {
        currentPreview = data;
        // Update DOM
        const img = document.getElementById('preview-image');
        const modal = document.getElementById('preview-modal');
        if (img && modal) {
            img.src = data.url;
            modal.style.display = 'flex';
        }
    }

    function shareCurrent() {
        if (!currentPreview || !currentPreview.url) return;
        
        // Convert Base64 to Blob for Sharing
        fetch(currentPreview.url)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "jewels_look.png", { type: "image/png" });
                if (navigator.share) {
                    navigator.share({
                        title: 'My Jewels-AI Look',
                        text: 'Check out this look I tried on!',
                        files: [file]
                    }).catch(console.error);
                } else {
                    alert("Sharing is not supported on this browser/device.");
                }
            });
    }

    function downloadCurrent() {
        if (!currentPreview || !currentPreview.url) return;
        saveAs(currentPreview.url, currentPreview.name);
    }

    /* --- 2. GALLERY & ZIP --- */
    function addToCollection(data) {
        collection.push(data);
    }

    function downloadZip() {
        if (collection.length === 0) {
            alert("No images in collection!"); 
            return;
        }
        const zip = new JSZip();
        const folder = zip.folder("Jewels-Ai_Collection");
        
        collection.forEach(item => {
            // Remove the "data:image/png;base64," prefix
            const base64Data = item.url.replace(/^data:image\/(png|jpg);base64,/, "");
            folder.file(item.name, base64Data, {base64: true});
        });

        zip.generateAsync({type:"blob"}).then(content => {
            saveAs(content, "Jewels-Ai_Collection.zip");
        });
    }

    function showGallery() {
        const grid = document.getElementById('gallery-grid');
        const modal = document.getElementById('gallery-modal');
        if (!grid || !modal) return;

        grid.innerHTML = ''; // Clear old
        
        if (collection.length === 0) {
            grid.innerHTML = '<p style="color:#666; width:100%; text-align:center;">No photos yet.</p>';
        }

        collection.forEach((item, index) => {
            const card = document.createElement('div'); 
            card.className = "gallery-card";
            
            const img = document.createElement('img'); 
            img.src = item.url; 
            img.className = "gallery-img";
            
            const overlay = document.createElement('div'); 
            overlay.className = "gallery-overlay";
            let cleanName = item.name.replace("Jewels-Ai_", "").substring(0,12);
            overlay.innerHTML = `<span class="overlay-text">${cleanName}</span>`;
            
            // On Click: Open Lightbox (We reuse Preview for simplicity)
            card.onclick = () => openPreview(item);
            
            card.appendChild(img); 
            card.appendChild(overlay); 
            grid.appendChild(card);
        });
        
        modal.style.display = 'flex';
    }

    /* --- 3. UI HELPERS --- */
    function closePreview() { 
        document.getElementById('preview-modal').style.display = 'none'; 
    }
    function closeGallery() { 
        document.getElementById('gallery-modal').style.display = 'none'; 
    }

    // Expose functions to Global Scope for HTML Buttons
    return {
        openPreview,
        shareCurrent,
        downloadCurrent,
        addToCollection,
        downloadZip,
        showGallery,
        closePreview,
        closeGallery
    };
})();

// Bind global buttons to this module
window.downloadSingleSnapshot = window.JewelsShare.downloadCurrent;
window.shareSingleSnapshot = window.JewelsShare.shareCurrent;
window.downloadAllAsZip = window.JewelsShare.downloadZip;
window.closePreview = window.JewelsShare.closePreview;
window.closeGallery = window.JewelsShare.closeGallery;