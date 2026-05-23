// ==========================================================================
// UI Effects & Animations (27netteam style)
// ==========================================================================

// Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Particles Canvas (Simple Implementation)
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#a855f7';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ==========================================================================
// App Logic
// ==========================================================================

// Elements
const btnAccount = document.getElementById('btn-account');
const configSection = document.getElementById('config-section');
const usernameInput = document.getElementById('github-username');
const patInput = document.getElementById('github-pat');
const btnOpenFolderModal = document.getElementById('btn-open-folder-modal');
const folderInput = document.getElementById('folder-input');
const folderDisplay = document.getElementById('folder-display');
const repoPrefixInput = document.getElementById('repo-prefix');
const repoPrivateToggle = document.getElementById('repo-private');
const btnStart = document.getElementById('btn-start');
const terminalLog = document.getElementById('terminal-log');
const processStatus = document.getElementById('process-status');
const resultSection = document.getElementById('result-section');
const resultLinks = document.getElementById('result-links');
const btnCopy = document.getElementById('btn-copy');

const fileListContainer = document.getElementById('file-list-container');
const fileListItems = document.getElementById('file-list-items');
let currentFilesData = []; // State array to store file info
let isUploading = false; // State to track upload progress

// Toggle Config Section
btnAccount.addEventListener('click', () => {
    configSection.classList.toggle('collapsed');
});

// Warn before reload if uploading
window.addEventListener('beforeunload', (e) => {
    if (isUploading) {
        // Most modern browsers ignore the custom string, but it's required to trigger the dialog
        const msg = "Quá trình upload đang diễn ra. Nếu tải lại trang, tiến trình sẽ bị hủy. Bạn có chắc chắn muốn thoát?";
        e.returnValue = msg;
        return msg;
    }
});

// Load stored config
window.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('gh_username')) usernameInput.value = localStorage.getItem('gh_username');
    if(localStorage.getItem('gh_pat')) patInput.value = localStorage.getItem('gh_pat');
});

// Save config on change
const saveConfig = () => {
    localStorage.setItem('gh_username', usernameInput.value.trim());
    localStorage.setItem('gh_pat', patInput.value.trim());
};
usernameInput.addEventListener('change', saveConfig);
patInput.addEventListener('change', saveConfig);

// Folder Selection Modal
const folderModal = document.getElementById('folder-modal');
const closeFolderModal = document.getElementById('close-folder-modal');
const dropZone = document.getElementById('drop-zone');

btnOpenFolderModal.addEventListener('click', () => {
    folderModal.classList.remove('hidden');
});

closeFolderModal.addEventListener('click', () => {
    folderModal.classList.add('hidden');
});

// Drag and drop visual feedback
folderInput.addEventListener('dragenter', () => {
    dropZone.classList.add('dragover');
});
folderInput.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});
folderInput.addEventListener('drop', () => {
    dropZone.classList.remove('dragover');
});

function removeVietnameseTones(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function updatePreviews() {
    let prefix = repoPrefixInput.value.trim();
    let nameCounts = {};
    
    for (let i = 0; i < currentFilesData.length; i++) {
        let data = currentFilesData[i];
        
        // Logic: Prefix + customBaseName
        let nameParts = [];
        if (prefix) nameParts.push(prefix);
        
        let baseNameToUse = data.customBaseName || data.originalBaseName;
        if (baseNameToUse) nameParts.push(baseNameToUse);
        
        let finalName = nameParts.join('_');
        
        // Sanitize: loại bỏ dấu tiếng việt và thay khoảng trắng bằng dấu gạch dưới
        finalName = removeVietnameseTones(finalName);
        finalName = finalName.replace(/\s+/g, '_'); 
        
        data.finalRepoName = finalName; // Save to state for upload
        
        if (nameCounts[finalName]) {
            nameCounts[finalName]++;
        } else {
            nameCounts[finalName] = 1;
        }
    }
    
    // Render
    for (let i = 0; i < currentFilesData.length; i++) {
        let finalName = currentFilesData[i].finalRepoName;
        let previewEl = document.getElementById(`preview-${i}`);
        
        if (nameCounts[finalName] > 1) {
            previewEl.innerText = finalName + " (TRÙNG)";
            previewEl.style.color = "#ff3333";
            previewEl.style.textShadow = "0 0 8px #ff3333";
        } else {
            previewEl.innerText = finalName;
            previewEl.style.color = "var(--neon-pink)";
            previewEl.style.textShadow = "0 0 5px rgba(255, 42, 109, 0.5)";
        }
    }
}

// Listen to global prefix changes to update all previews
repoPrefixInput.addEventListener('input', (e) => {
    let start = e.target.selectionStart;
    let end = e.target.selectionEnd;
    e.target.value = removeVietnameseTones(e.target.value);
    e.target.setSelectionRange(start, end);
    updatePreviews();
});

folderInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const firstFile = e.target.files[0];
        const folderName = firstFile.webkitRelativePath.split('/')[0];
        folderDisplay.value = `${folderName} (${e.target.files.length} files)`;
        folderModal.classList.add('hidden'); // Auto close modal after selection
        
        // Render File List
        currentFilesData = [];
        fileListItems.innerHTML = '';
        fileListContainer.classList.remove('hidden');
        
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            let fileNameFull = file.name;
            let fileNameWithoutExt = fileNameFull.substring(0, fileNameFull.lastIndexOf('.')) || fileNameFull;
            
            // Create data object
            let cleanBaseName = removeVietnameseTones(fileNameWithoutExt);
            currentFilesData.push({
                file: file,
                index: i,
                originalBaseName: cleanBaseName,
                customBaseName: cleanBaseName
            });
            
            // Create DOM element (Table Row)
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="file-item-name" title="${fileNameFull}">${fileNameFull}</td>
                <td class="file-item-suffix">
                    <input type="text" id="basename-${i}" value="${cleanBaseName}">
                </td>
                <td class="file-item-preview" id="preview-${i}"></td>
            `;
            fileListItems.appendChild(tr);
            
            // Add listener to individual basename input
            const basenameInput = document.getElementById(`basename-${i}`);
            basenameInput.addEventListener('input', (event) => {
                let start = event.target.selectionStart;
                let end = event.target.selectionEnd;
                event.target.value = removeVietnameseTones(event.target.value);
                event.target.setSelectionRange(start, end);
                currentFilesData[i].customBaseName = event.target.value.trim();
                updatePreviews();
            });
            
            // Revert to original if left empty when user clicks away
            basenameInput.addEventListener('blur', (event) => {
                if (event.target.value.trim() === '') {
                    event.target.value = currentFilesData[i].originalBaseName;
                    currentFilesData[i].customBaseName = currentFilesData[i].originalBaseName;
                    updatePreviews();
                }
            });
        }
        updatePreviews(); // Initial preview calculation
        
    } else {
        folderDisplay.value = "";
        fileListContainer.classList.add('hidden');
        currentFilesData = [];
    }
});

// Logging utility
function logTerminal(message, type = 'info') {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    div.innerHTML = `<span class="time">[${time}]</span> ${message}`;
    terminalLog.appendChild(div);
    terminalLog.scrollTop = terminalLog.scrollHeight;
}

// Support Banner Close
const supportBanner = document.getElementById('support-banner');
const btnCloseBanner = document.getElementById('close-banner');
if (btnCloseBanner && supportBanner) {
    btnCloseBanner.addEventListener('click', (e) => {
        e.preventDefault();
        supportBanner.classList.add('fade-out');
        setTimeout(() => {
            supportBanner.style.display = 'none';
        }, 500);
    });
}

// Typewriter effect
const twTexts = ["Donate dự án nếu thấy hay và hữu ích","Nhà chung sinh viên PTIT x Rikkei","Click me to donate ❤️"];
const twElement = document.getElementById('typewriter');
let twIndex = 0;
let twTextIndex = 0;
let twIsDeleting = false;

function typeWriter() {
    if (!twElement) return;
    
    const currentText = twTexts[twTextIndex];
    
    if (twIsDeleting) {
        twElement.innerText = currentText.substring(0, twIndex - 1);
        twIndex--;
    } else {
        twElement.innerText = currentText.substring(0, twIndex + 1);
        twIndex++;
    }

    let typeSpeed = twIsDeleting ? 50 : 120;

    if (!twIsDeleting && twIndex === currentText.length) {
        typeSpeed = 2500;
        twIsDeleting = true;
    } else if (twIsDeleting && twIndex === 0) {
        twIsDeleting = false;
        twTextIndex = (twTextIndex + 1) % twTexts.length;
        typeSpeed = 500;
    }
    setTimeout(typeWriter, typeSpeed);
}
if(twElement) typeWriter();

// Copy to clipboard
btnCopy.addEventListener('click', () => {
    resultLinks.select();
    document.execCommand('copy');
    const originalText = btnCopy.innerText;
    btnCopy.innerText = "Đã copy!";
    setTimeout(() => { btnCopy.innerText = originalText; }, 2000);
});

// Custom Popup
const customPopup = document.getElementById('custom-popup');
const popupMessage = document.getElementById('popup-message');
const popupClose = document.getElementById('popup-close');

function showPopup(message) {
    if(popupMessage) popupMessage.innerText = message;
    if(customPopup) customPopup.classList.remove('hidden');
}

if (popupClose) {
    popupClose.addEventListener('click', () => {
        customPopup.classList.add('hidden');
    });
}

// ==========================================================================
// GitHub REST API Integration
// ==========================================================================

async function githubRequest(url, method = 'GET', body = null, pat) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json'
    };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        let errStr = response.statusText;
        try {
            const errJson = await response.json();
            if(errJson.message) errStr = errJson.message;
        } catch(e){}
        throw new Error(`API Error ${response.status}: ${errStr}`);
    }
    return response.json();
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // result is "data:MIME;base64,CONTENT..."
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Main Process
btnStart.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const pat = patInput.value.trim();
    const files = folderInput.files;
    let prefix = repoPrefixInput.value.trim();
    const isPrivate = repoPrivateToggle.checked;

    if (!username || !pat) {
        showPopup("Vui lòng nhập Username và PAT.");
        return;
    }
    if (files.length === 0) {
        showPopup("Vui lòng chọn thư mục nguồn.");
        return;
    }
    
    // Check for duplicates
    let names = currentFilesData.map(d => d.finalRepoName);
    let hasDuplicates = new Set(names).size !== names.length;
    if (hasDuplicates) {
        showPopup("Phát hiện tên Repository bị TRÙNG LẶP. Vui lòng sửa lại tên các file bị trùng (màu đỏ) để tránh lỗi API.");
        return;
    }

    // Show donate ad modal first
    const donateModal = document.getElementById('donate-ad-modal');
    donateModal.classList.remove('hidden');
    
    // Wait for user to click continue
    document.getElementById('donate-ad-continue').onclick = async () => {
        donateModal.classList.add('hidden');
        await startUploadProcess(username, pat, files, prefix, isPrivate);
    };
    
    // Close button
    document.getElementById('donate-ad-close').onclick = () => {
        donateModal.classList.add('hidden');
    };
});

async function startUploadProcess(username, pat, files, prefix, isPrivate) {
    isUploading = true;
    logTerminal("--------------------------------", "info");
    logTerminal(`🚀 Bắt đầu tạo repository cho từng file (${files.length} files)`, "system");
    processStatus.innerText = "Đang chạy...";
    processStatus.style.color = "var(--neon-green)";
    btnStart.disabled = true;
    
    // Clear previous results
    resultLinks.value = ""; 

    try {
        saveConfig();

        for (let i = 0; i < currentFilesData.length; i++) {
            const data = currentFilesData[i];
            const file = data.file;
            let fileNameFull = file.name;
            
            // Lấy tên repo đã được preview và lưu sẵn
            let repoName = data.finalRepoName;

            logTerminal(`\n⏳ Đang xử lý file ${i+1}/${currentFilesData.length}: ${fileNameFull}`, "info");

            // 1. Create Repository
            logTerminal(`   -> Tạo Repository: ${repoName}...`, "info");
            const repoData = await githubRequest('https://api.github.com/user/repos', 'POST', {
                name: repoName,
                private: isPrivate,
                auto_init: true
            }, pat);
            const repoUrl = repoData.html_url;
            const actualRepoName = repoData.name;
            logTerminal(`   ✅ Tạo repo thành công: ${actualRepoName}`, "success");

            // Add a small delay to ensure GitHub has fully initialized the repo and default branch
            await new Promise(r => setTimeout(r, 1500));

            // 2. Get reference to main/master
            let defaultBranch = repoData.default_branch || "main";
            const refData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/ref/heads/${defaultBranch}`, 'GET', null, pat);
            const latestCommitSha = refData.object.sha;

            const commitData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/commits/${latestCommitSha}`, 'GET', null, pat);
            const baseTreeSha = commitData.tree.sha;

            // 3. Create Blob for the file
            logTerminal(`   -> Uploading nội dung file...`, "info");
            const base64Content = await readFileAsBase64(file);
            const blobData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/blobs`, 'POST', {
                content: base64Content,
                encoding: "base64"
            }, pat);

            const treeItems = [{
                path: fileNameFull, // Put the file at the root of its own repo
                mode: "100644",
                type: "blob",
                sha: blobData.sha
            }];

            // 4. Create new tree
            const newTreeData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/trees`, 'POST', {
                base_tree: baseTreeSha,
                tree: treeItems
            }, pat);

            // 5. Create new commit
            const newCommitData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/commits`, 'POST', {
                message: `Add ${fileNameFull} via Git Upload 27NetTeam`,
                tree: newTreeData.sha,
                parents: [latestCommitSha]
            }, pat);

            // 6. Update reference
            logTerminal(`   -> Đang push lên GitHub...`, "info");
            await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/refs/heads/${defaultBranch}`, 'PATCH', {
                sha: newCommitData.sha
            }, pat);

            logTerminal(`   🎉 Hoàn tất repo cho: ${fileNameFull}`, "success");
            
            // Show result link for this repo
            resultSection.classList.remove('hidden');
            resultLinks.value += (resultLinks.value ? "\n" : "") + repoUrl;
        }

        logTerminal(`\n✅ TẤT CẢ FILE ĐÃ ĐƯỢC ĐẨY LÊN GITHUB!`, "success");
        processStatus.innerText = "Hoàn thành";
        
    } catch (error) {
        console.error(error);
        logTerminal(`❌ Lỗi: ${error.message}`, "error");
        processStatus.innerText = "Lỗi";
        processStatus.style.color = "var(--neon-pink)";
    } finally {
        isUploading = false;
        btnStart.disabled = false;
    }
}

// Version Display
const appVersionElement = document.getElementById('app-version');
if (appVersionElement) {
    appVersionElement.innerText = "phiên bản : JS-V2.1";
}
