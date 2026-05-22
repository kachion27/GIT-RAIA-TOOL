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

// Toggle Config Section
btnAccount.addEventListener('click', () => {
    configSection.classList.toggle('collapsed');
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

folderInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const firstFile = e.target.files[0];
        const folderName = firstFile.webkitRelativePath.split('/')[0];
        folderDisplay.value = `${folderName} (${e.target.files.length} files)`;
        folderModal.classList.add('hidden'); // Auto close modal after selection
    } else {
        folderDisplay.value = "";
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
const twTexts = ["Donate dự án nếu thấy hay và hữu ích","Nhà chung sinh viên PTIT x Rikkei","Click me to QR donate ❤️","V2.0"];
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

    logTerminal("--------------------------------", "info");
    logTerminal(`🚀 Bắt đầu tạo repository cho từng file (${files.length} files)`, "system");
    processStatus.innerText = "Đang chạy...";
    processStatus.style.color = "var(--neon-green)";
    btnStart.disabled = true;
    
    // Clear previous results
    resultLinks.value = ""; 

    try {
        saveConfig();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Format repo name based on file name
            let fileNameFull = file.name;
            let fileNameWithoutExt = fileNameFull.substring(0, fileNameFull.lastIndexOf('.')) || fileNameFull;
            let baseRepoName = prefix ? `${prefix}-${fileNameWithoutExt}` : fileNameWithoutExt;
            let repoName = baseRepoName.replace(/\s+/g, '-');

            logTerminal(`\n⏳ Đang xử lý file ${i+1}/${files.length}: ${fileNameFull}`, "info");

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
        btnStart.disabled = false;
    }
});
