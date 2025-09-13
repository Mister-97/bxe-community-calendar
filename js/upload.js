// Image upload handling
let uploadedImage = null;

// Setup image upload functionality
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast('Image must be smaller than 5MB', 'error');
                return;
            }

            uploadImageToStorage(file);
        });
    }
}

// Upload image to Firebase Storage
async function uploadImageToStorage(file) {
    try {
        const uploadText = document.getElementById('uploadText');
        uploadText.innerHTML = '<div style="color: #ffd700;">Uploading image...</div>';
        
        const timestamp = Date.now();
        const fileName = `event-images/${timestamp}_${file.name}`;
        const storageRef = storage.ref(fileName);
        
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        uploadedImage = downloadURL;
        showImagePreview(downloadURL);
        showToast('Image uploaded successfully!');
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Failed to upload image. Please try again.', 'error');
        resetImageUpload();
    }
}

// Show image preview in upload area
function showImagePreview(imageSrc) {
    const uploadArea = document.querySelector('.upload-area');
    const uploadText = document.getElementById('uploadText');
    const imagePreview = document.getElementById('imagePreview');

    if (uploadArea && uploadText && imagePreview) {
        uploadArea.classList.add('has-image');
        uploadText.style.display = 'none';
        imagePreview.style.display = 'block';
        imagePreview.innerHTML = `
            <img src="${imageSrc}" class="image-preview" alt="Event image">
            <div style="padding: 10px; color: #28a745; font-size: 14px;">✓ Image ready</div>
        `;
    }
}

// Reset image upload area
function resetImageUpload() {
    const uploadArea = document.querySelector('.upload-area');
    const uploadText = document.getElementById('uploadText');
    const imagePreview = document.getElementById('imagePreview');
    const imageUpload = document.getElementById('imageUpload');

    if (uploadArea) uploadArea.classList.remove('has-image');
    if (uploadText) {
        uploadText.style.display = 'block';
        uploadText.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">📷</div>
            <div>Click to upload image or drag and drop</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">PNG, JPG up to 5MB</div>
        `;
    }
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
    }
    if (imageUpload) imageUpload.value = '';
    uploadedImage = null;
}
