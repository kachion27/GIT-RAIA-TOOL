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
// Auth State (Must be initialized early for clock greeting)
// ==========================================================================
let oauthToken = localStorage.getItem('gh_oauth_token') || null;
let oauthUsername = localStorage.getItem('gh_oauth_username') || null;
let oauthAvatar = localStorage.getItem('gh_oauth_avatar') || null;

// ==========================================================================
// Clock & Weather Widgets
// ==========================================================================

function updateClock() {
    const now = new Date();
    // Vietnam time (UTC+7)
    const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    const hours = vnTime.getHours().toString().padStart(2, '0');
    const minutes = vnTime.getMinutes().toString().padStart(2, '0');
    const seconds = vnTime.getSeconds().toString().padStart(2, '0');
    
    const clockTime = document.getElementById('clock-time');
    if (clockTime) clockTime.textContent = `${hours}:${minutes}:${seconds}`;
    
    const h = vnTime.getHours();
    let greeting = 'Chào bạn! 👋';
    if (h >= 5 && h < 11) greeting = 'Chào buổi sáng! 🌅';
    else if (h >= 11 && h < 14) greeting = 'Chào buổi trưa! 🌞';
    else if (h >= 14 && h < 18) greeting = 'Chào buổi chiều! 🌤️';
    else if (h >= 18 && h < 22) greeting = 'Chào buổi tối! 🌙';
    else greeting = 'Khuya rồi ngủ thôi! 💤';

    // If logged in, update the greeting in the auth section
    if (oauthToken && oauthUsername) {
        const authGreeting = document.getElementById('auth-greeting');
        if (authGreeting) authGreeting.textContent = greeting;
    }
}

// Update clock every second
updateClock();
setInterval(updateClock, 1000);

// Weather from Open-Meteo (reliable, no API key)
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true');
        const data = await response.json();
        
        const tempC = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        
        // Simple mapping for WMO weather codes
        let emoji = '⛅';
        if (code === 0) emoji = '☀️';
        else if (code === 1 || code === 2) emoji = '⛅';
        else if (code === 3) emoji = '☁️';
        else if ([45, 48].includes(code)) emoji = '🌫️';
        else if ([51, 53, 55, 56, 57].includes(code)) emoji = '🌧️';
        else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) emoji = '🌧️';
        else if ([71, 73, 75, 77, 85, 86].includes(code)) emoji = '❄️';
        else if ([95, 96, 99].includes(code)) emoji = '⛈️';
        
        const weatherTemp = document.getElementById('weather-temp');
        const weatherEmoji = document.getElementById('weather-emoji');
        
        if (weatherTemp) weatherTemp.textContent = `${tempC}°C`;
        if (weatherEmoji) weatherEmoji.textContent = emoji;
    } catch (e) {
        const weatherTemp = document.getElementById('weather-temp');
        if (weatherTemp) weatherTemp.textContent = 'Lỗi';
    }
}
fetchWeather();
// Refresh weather every 10 minutes
setInterval(fetchWeather, 600000);

// ==========================================================================
// GitHub OAuth Login
// ==========================================================================

// GitHub OAuth App Configuration
// IMPORTANT: You need to register a GitHub OAuth App at https://github.com/settings/applications/new
// Set the callback URL to your app's URL (e.g., https://27netteam.top/)
const GITHUB_CLIENT_ID = 'Ov23lixGrKca2GHnclHj';

// Google Apps Script URL for OAuth token exchange proxy
// IMPORTANT: Deploy your Google Apps Script and paste the URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzynWaiH-rEb7dY1jkFa8g1LcfE61EvWZELlU2GrtbQ0pdLTu1Ura8RCnazADwCoafk/exec';

// Auth state is now at the top of the file

const btnGithubLogin = document.getElementById('btn-github-login');
const btnLogout = document.getElementById('btn-logout');
const authLoggedOut = document.getElementById('github-logged-out');
const authLoggedIn = document.getElementById('github-logged-in');
const authAvatar = document.getElementById('auth-avatar');
const authUsername = document.getElementById('auth-username');

function updateAuthUI() {
    if (oauthToken && oauthUsername) {
        // Logged in
        authLoggedOut.classList.add('hidden');
        authLoggedIn.classList.remove('hidden');
        authUsername.textContent = oauthUsername;
        authAvatar.src = oauthAvatar || `https://github.com/${oauthUsername}.png`;
        updateClock(); // trigger greeting update
    } else {
        // Logged out
        authLoggedOut.classList.remove('hidden');
        authLoggedIn.classList.add('hidden');
        
        // Restore default sleek header subtitle
        const headerSubtitle = document.getElementById('header-subtitle');
        if (headerSubtitle) headerSubtitle.textContent = 'Git Upload - Tự động hóa quy trình đẩy bài tập lên GitHub';
    }
}

// Check for OAuth callback code in URL
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (code) {
        // If we are in a popup window, send the code to the parent and close
        if (window.opener) {
            window.opener.postMessage({ type: 'oauth_code', code: code }, window.location.origin);
            window.close();
            return;
        }

        // Remove code from URL to clean up
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show loading state
        if (btnGithubLogin) {
            btnGithubLogin.disabled = true;
            btnGithubLogin.innerHTML = `
                <svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite;"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                Đang đăng nhập...
            `;
        }
        
        // Exchange code for token via Google Apps Script proxy
        exchangeCodeForToken(code);
    } else if (error) {
        if (window.opener) {
            window.opener.postMessage({ type: 'oauth_error', error: error }, window.location.origin);
            window.close();
            return;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        showPopup('Đăng nhập bị hủy hoặc thất bại: ' + error);
    }
}

async function exchangeCodeForToken(code) {
    if (!APPS_SCRIPT_URL) {
        console.error('APPS_SCRIPT_URL chưa được cấu hình');
        showPopup('Chức năng đăng nhập OAuth chưa được cấu hình.');
        resetLoginButton();
        return;
    }

    try {
        // Call Google Apps Script proxy to exchange code for token
        const proxyUrl = `${APPS_SCRIPT_URL}?action=oauth&code=${encodeURIComponent(code)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.status === 'success' && data.access_token) {
            await completeLogin(data.access_token);
        } else {
            throw new Error(data.message || 'Không lấy được access token');
        }
    } catch (error) {
        console.error('OAuth exchange error:', error);
        showPopup('Đăng nhập thất bại: ' + error.message + '. Vui lòng thử lại.');
        resetLoginButton();
    }
}

function resetLoginButton() {
    if (btnGithubLogin) {
        btnGithubLogin.disabled = false;
        btnGithubLogin.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Đăng nhập bằng GitHub
        `;
    }
}

async function completeLogin(token) {
    try {
        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!userResponse.ok) {
            let errText = await userResponse.text();
            console.error('GitHub API User Error:', userResponse.status, errText);
            throw new Error(`Mã lỗi ${userResponse.status}. Chi tiết: ${errText}`);
        }
        
        const user = JSON.parse(await userResponse.text());
        
        oauthToken = token;
        oauthUsername = user.login;
        oauthAvatar = user.avatar_url;
        
        localStorage.setItem('gh_oauth_token', oauthToken);
        localStorage.setItem('gh_oauth_username', oauthUsername);
        localStorage.setItem('gh_oauth_avatar', oauthAvatar);
        
        updateAuthUI();
    } catch (error) {
        console.error('Login complete error:', error);
        showPopup('Không thể lấy thông tin tài khoản. Lỗi: ' + error.message);
    }
}

// Function to open GitHub Auth in a popup
function openGitHubLoginPopup() {
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'repo';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&prompt=consent`;
    
    const width = 500;
    const height = 750;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    window.open(authUrl, 'github_oauth', `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`);
}

// Listen for messages from the OAuth popup
window.addEventListener('message', (event) => {
    // Ensure the message is coming from our own origin
    if (event.origin !== window.location.origin) return;
    
    if (event.data && event.data.type === 'oauth_code') {
        const code = event.data.code;
        
        // Show loading state
        if (btnGithubLogin) {
            btnGithubLogin.disabled = true;
            btnGithubLogin.innerHTML = `
                <svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite;"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                Đang đăng nhập...
            `;
        }
        
        // Hide login required modal if open
        if (loginRequiredModal) {
            loginRequiredModal.classList.add('hidden');
        }
        
        // Process login
        exchangeCodeForToken(code);
    } else if (event.data && event.data.type === 'oauth_error') {
        showPopup('Đăng nhập đã bị hủy.');
    }
});

// Login button click
if (btnGithubLogin) {
    btnGithubLogin.addEventListener('click', openGitHubLoginPopup);
}

const loginRequiredModal = document.getElementById('login-required-modal');
const btnLoginFromModal = document.getElementById('btn-login-from-modal');
const closeLoginModal = document.getElementById('close-login-modal');

if (btnLoginFromModal) {
    btnLoginFromModal.addEventListener('click', openGitHubLoginPopup);
}

if (closeLoginModal) {
    closeLoginModal.addEventListener('click', () => {
        loginRequiredModal.classList.add('hidden');
    });
}

// Logout button
if (btnLogout) {
    const logoutConfirmModal = document.getElementById('logout-confirm-modal');
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');
    const btnCancelLogout = document.getElementById('btn-cancel-logout');

    btnLogout.addEventListener('click', () => {
        if (logoutConfirmModal) {
            logoutConfirmModal.classList.remove('hidden');
        }
    });

    if (btnCancelLogout) {
        btnCancelLogout.addEventListener('click', () => {
            logoutConfirmModal.classList.add('hidden');
        });
    }

    if (btnConfirmLogout) {
        btnConfirmLogout.addEventListener('click', () => {
            logoutConfirmModal.classList.add('hidden');
            oauthToken = null;
            oauthUsername = null;
            oauthAvatar = null;
            localStorage.removeItem('gh_oauth_token');
            localStorage.removeItem('gh_oauth_username');
            localStorage.removeItem('gh_oauth_avatar');
            
            updateAuthUI();
            resetLoginButton();
        });
    }
}

// Success Modal Logic
const successModal = document.getElementById('success-modal');
const successLinksTextarea = document.getElementById('success-links-textarea');
const btnCopySuccessLinks = document.getElementById('btn-copy-success-links');
const closeSuccessModal = document.getElementById('close-success-modal');

if (closeSuccessModal) {
    closeSuccessModal.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });
}

if (btnCopySuccessLinks) {
    btnCopySuccessLinks.addEventListener('click', () => {
        successLinksTextarea.select();
        document.execCommand("copy");
        const originalText = btnCopySuccessLinks.innerHTML;
        btnCopySuccessLinks.innerHTML = '✅ Đã Copy!';
        setTimeout(() => {
            btnCopySuccessLinks.innerHTML = originalText;
        }, 2000);
    });
}

// ==========================================================================
// App Logic
// ==========================================================================

// Elements
const btnOpenFolderModal = document.getElementById('btn-open-folder-modal');
const folderInput = document.getElementById('folder-input');
const folderDisplay = document.getElementById('folder-display');
const repoPrefixInput = document.getElementById('repo-prefix');
const repoPrivateToggle = document.getElementById('repo-private');
const btnStart = document.getElementById('btn-start');
const resultSection = document.getElementById('result-section');
const resultLinks = document.getElementById('result-links');
const btnCopy = document.getElementById('btn-copy');

const fileListContainer = document.getElementById('file-list-container');
const fileListItems = document.getElementById('file-list-items');
const fileCountBadge = document.getElementById('file-count-badge');
let currentFilesData = []; // State array to store file info
let isUploading = false; // State to track upload progress

// Warn before reload if uploading
window.addEventListener('beforeunload', (e) => {
    if (isUploading) {
        const msg = "Quá trình upload đang diễn ra. Nếu tải lại trang, tiến trình sẽ bị hủy. Bạn có chắc chắn muốn thoát?";
        e.returnValue = msg;
        return msg;
    }
});

// Load stored config
window.addEventListener('DOMContentLoaded', () => {
    // Handle OAuth callback first
    handleOAuthCallback();
    
    // Then update auth UI
    updateAuthUI();
});

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

// Get file extension icon
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'py': '🐍', 'js': '📜', 'ts': '📘', 'html': '🌐', 'css': '🎨',
        'java': '☕', 'c': '⚙️', 'cpp': '⚙️', 'h': '⚙️', 'cs': '💠',
        'php': '🐘', 'rb': '💎', 'go': '🔵', 'rs': '🦀', 'swift': '🍎',
        'kt': '🟣', 'sql': '🗃️', 'json': '📋', 'xml': '📄', 'md': '📝',
        'txt': '📄', 'pdf': '📕', 'zip': '📦', 'rar': '📦',
        'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
        'mp4': '🎬', 'mp3': '🎵', 'doc': '📘', 'docx': '📘', 'xls': '📊', 'xlsx': '📊',
        'ppt': '📊', 'pptx': '📊',
    };
    return iconMap[ext] || '📄';
}

function updatePreviews() {
    let prefix = repoPrefixInput.value.trim();
    let nameCounts = {};
    
    for (let i = 0; i < currentFilesData.length; i++) {
        let data = currentFilesData[i];
        
        let nameParts = [];
        if (prefix) {
            nameParts.push(prefix);
        } else if (data.file && data.file.webkitRelativePath) {
            let folderName = data.file.webkitRelativePath.split('/')[0];
            if (folderName) nameParts.push(folderName);
        }
        
        let baseNameToUse = data.customBaseName || data.originalBaseName;
        if (baseNameToUse) nameParts.push(baseNameToUse);
        
        let finalName = nameParts.join('_');
        
        finalName = removeVietnameseTones(finalName);
        finalName = finalName.replace(/\s+/g, '_'); 
        
        data.finalRepoName = finalName;
        
        if (nameCounts[finalName]) {
            nameCounts[finalName]++;
        } else {
            nameCounts[finalName] = 1;
        }
    }
    
    // Render
    for (let i = 0; i < currentFilesData.length; i++) {
        let finalName = currentFilesData[i].finalRepoName;
        let repoSpan = document.getElementById(`repo-preview-${i}`);
        
        if (repoSpan) {
            if (nameCounts[finalName] > 1) {
                repoSpan.innerText = finalName + " (TRÙNG)";
                repoSpan.style.color = "#ff3333";
            } else {
                repoSpan.innerText = finalName;
                repoSpan.style.color = "";
            }
        }
    }
}

// Attach the handler to the original modal input
folderInput.addEventListener('change', (e) => {
    handleFolderSelect(e.target.files);
});

// Global Drag and Drop Overlay Logic
const globalDropOverlay = document.getElementById('global-drop-overlay');
const globalFolderInput = document.getElementById('global-folder-input');

if (globalDropOverlay && globalFolderInput) {
    // Show overlay when dragging anywhere on window
    window.addEventListener('dragenter', (e) => {
        // Prevent global drop from interfering if the specific folder modal is already open
        if (!folderModal.classList.contains('hidden')) {
            return;
        }

        // Only trigger if it might be a file drag
        if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
            globalDropOverlay.classList.remove('hidden');
        }
    });

    // Hide overlay when leaving the window
    globalDropOverlay.addEventListener('dragleave', (e) => {
        // Prevent flickering by checking if we actually left the overlay
        if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
            globalDropOverlay.classList.add('hidden');
        }
    });

    // Handle file drop on the invisible input
    globalFolderInput.addEventListener('change', (e) => {
        globalDropOverlay.classList.add('hidden');
        handleFolderSelect(e.target.files);
    });
}

// Listen to global prefix changes to update all previews
repoPrefixInput.addEventListener('input', (e) => {
    let start = e.target.selectionStart;
    let end = e.target.selectionEnd;
    e.target.value = removeVietnameseTones(e.target.value);
    e.target.setSelectionRange(start, end);
    updatePreviews();
});

// Also update previews when privacy toggle changes
repoPrivateToggle.addEventListener('change', () => {
    updatePrivacyBadges();
});

function updatePrivacyBadges() {
    const isPrivate = repoPrivateToggle.checked;
    const badges = document.querySelectorAll('.privacy-badge');
    badges.forEach(badge => {
        if (isPrivate) {
            badge.className = 'privacy-badge private';
            badge.innerHTML = '🔒 Private';
        } else {
            badge.className = 'privacy-badge public';
            badge.innerHTML = '🌐 Public';
        }
    });
}

function handleFolderSelect(files) {
    if (files.length > 0) {
        const firstFile = files[0];
        const folderName = firstFile.webkitRelativePath.split('/')[0];
        folderDisplay.value = `${folderName} (${files.length} files)`;
        folderModal.classList.add('hidden');
        
        // Render File Cards
        currentFilesData = [];
        fileListItems.innerHTML = '';
        fileListContainer.classList.remove('hidden');
        
        if (fileCountBadge) {
            fileCountBadge.textContent = `${files.length} file(s)`;
        }
        
        const isPrivate = repoPrivateToggle.checked;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let fileNameFull = file.name;
            let fileNameWithoutExt = fileNameFull.substring(0, fileNameFull.lastIndexOf('.')) || fileNameFull;
            
            let cleanBaseName = removeVietnameseTones(fileNameWithoutExt);
            currentFilesData.push({
                file: file,
                index: i,
                originalBaseName: cleanBaseName,
                customBaseName: cleanBaseName
            });
            
            // Create Card DOM
            const card = document.createElement('div');
            card.className = 'file-card status-pending';
            card.id = `file-card-${i}`;
            card.innerHTML = `
                <div class="file-card-header">
                    <div class="file-card-left">
                        <div class="file-card-icon">${getFileIcon(fileNameFull)}</div>
                        <div class="file-card-info">
                            <div class="file-card-name" title="${fileNameFull}">${fileNameFull}</div>
                            <div class="file-card-meta">
                                <span class="privacy-badge ${isPrivate ? 'private' : 'public'}">${isPrivate ? '🔒 Private' : '🌐 Public'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-card-middle">
                        <span class="repo-label">Tên Repo:</span>
                        <span id="repo-preview-${i}" class="repo-preview-text"></span>
                        <div class="file-card-suffix">
                            <input type="text" id="basename-${i}" value="${cleanBaseName}" placeholder="Tên hậu tố">
                        </div>
                    </div>

                    <div class="file-card-right">
                        <div class="file-card-status" id="status-badge-${i}">
                            <span class="status-icon" id="status-icon-${i}">⏳</span>
                            <span class="status-text" id="status-text-${i}">Chờ xử lý</span>
                        </div>
                    </div>
                </div>
                <div class="file-card-progress" id="progress-${i}">
                    <div class="progress-header">
                        <span class="progress-label" id="progress-label-${i}">Đang chờ...</span>
                        <span class="progress-percent" id="progress-percent-${i}">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill-${i}"></div>
                    </div>
                    <div class="file-card-error-msg" id="error-msg-${i}"></div>
                </div>
            `;
            fileListItems.appendChild(card);
            
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
            
            basenameInput.addEventListener('blur', (event) => {
                if (event.target.value.trim() === '') {
                    event.target.value = currentFilesData[i].originalBaseName;
                    currentFilesData[i].customBaseName = currentFilesData[i].originalBaseName;
                    updatePreviews();
                }
            });
        }
        updatePreviews();
        
    } else {
        folderDisplay.value = "";
        fileListContainer.classList.add('hidden');
        currentFilesData = [];
    }
}

// ==========================================================================
// Progress Bar Helpers
// ==========================================================================

function updateFileProgress(index, percent, label) {
    const progressEl = document.getElementById(`progress-${index}`);
    const fillEl = document.getElementById(`progress-fill-${index}`);
    const percentEl = document.getElementById(`progress-percent-${index}`);
    const labelEl = document.getElementById(`progress-label-${index}`);
    
    if (progressEl) progressEl.classList.add('active');
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (labelEl) labelEl.textContent = label;
}

function setFileStatus(index, status, errorMsg = '') {
    const card = document.getElementById(`file-card-${index}`);
    const statusIcon = document.getElementById(`status-icon-${index}`);
    const statusText = document.getElementById(`status-text-${index}`);
    const errorMsgEl = document.getElementById(`error-msg-${index}`);
    
    if (card) {
        card.className = `file-card status-${status}`;
    }
    
    if (statusIcon && statusText) {
        switch(status) {
            case 'uploading':
                statusIcon.textContent = '🔄';
                statusText.textContent = 'Đang tải...';
                break;
            case 'done':
                statusIcon.textContent = '✅';
                statusText.textContent = 'Thành công';
                break;
            case 'error':
                statusIcon.textContent = '❌';
                statusText.textContent = 'Thất bại';
                break;
            default:
                statusIcon.textContent = '⏳';
                statusText.textContent = 'Chờ xử lý';
        }
    }
    
    if (errorMsgEl && errorMsg) {
        errorMsgEl.textContent = errorMsg;
    }
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
        let translatedMsg = `Lỗi API ${response.status}: ${errStr}`;
        if (response.status === 401) translatedMsg = `Lỗi 401: Xác thực thất bại (Vui lòng đăng nhập lại).`;
        else if (response.status === 403) translatedMsg = `Lỗi 403: Bị từ chối truy cập (Thiếu quyền cấp cho ứng dụng).`;
        else if (response.status === 404) translatedMsg = `Lỗi 404: Không tìm thấy tài khoản hoặc tài nguyên.`;
        else if (response.status === 409) translatedMsg = `Lỗi 409: Xung đột dữ liệu (Repo trống hoặc có lỗi đẩy code).`;
        else if (response.status === 422) translatedMsg = `Lỗi 422: Tên Repository đã tồn tại trên GitHub hoặc chứa ký tự không hợp lệ.`;
        
        throw new Error(translatedMsg);
    }
    return response.json();
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Main Process
btnStart.addEventListener('click', async () => {
    if (currentFilesData.length === 0) {
        showPopup("Vui lòng chọn thư mục chứa project của bạn (Thư mục nguồn).");
        return;
    }

    if (!oauthToken) {
        if (loginRequiredModal) {
            loginRequiredModal.classList.remove('hidden');
        } else {
            showPopup("Vui lòng đăng nhập GitHub để tiếp tục.");
        }
        return;
    }

    let username = oauthUsername;
    let pat = oauthToken;
    let prefix = repoPrefixInput.value.trim();
    const isPrivate = repoPrivateToggle.checked;
    
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
        await startUploadProcess(username, pat, prefix, isPrivate);
    };
    
    // Close button
    document.getElementById('donate-ad-close').onclick = () => {
        donateModal.classList.add('hidden');
    };
});

async function startUploadProcess(username, pat, prefix, isPrivate) {
    isUploading = true;
    btnStart.disabled = true;
    
    // Clear previous results
    resultLinks.value = ""; 

    // Disable all basename inputs during upload
    document.querySelectorAll('.file-card-suffix input').forEach(input => {
        input.disabled = true;
    });

    try {

        for (let i = 0; i < currentFilesData.length; i++) {
            const data = currentFilesData[i];
            const file = data.file;
            let fileNameFull = file.name;
            let repoName = data.finalRepoName;

            // Start progress for this file
            setFileStatus(i, 'uploading');
            updateFileProgress(i, 5, 'Đang tạo Repository...');

            try {
                // 1. Create Repository
                updateFileProgress(i, 15, `Đang tạo repo: ${repoName}...`);
                const repoData = await githubRequest('https://api.github.com/user/repos', 'POST', {
                    name: repoName,
                    private: isPrivate,
                    auto_init: true
                }, pat);
                const repoUrl = repoData.html_url;
                const actualRepoName = repoData.name;

                updateFileProgress(i, 30, 'Repo đã tạo. Đang khởi tạo...');

                // Add delay for GitHub to initialize
                await new Promise(r => setTimeout(r, 1500));

                // 2. Get reference to main/master
                updateFileProgress(i, 40, 'Đang lấy reference branch...');
                let defaultBranch = repoData.default_branch || "main";
                const refData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/ref/heads/${defaultBranch}`, 'GET', null, pat);
                const latestCommitSha = refData.object.sha;

                const commitData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/commits/${latestCommitSha}`, 'GET', null, pat);
                const baseTreeSha = commitData.tree.sha;

                // 3. Create Blob
                updateFileProgress(i, 55, 'Đang upload nội dung file...');
                const base64Content = await readFileAsBase64(file);
                const blobData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/blobs`, 'POST', {
                    content: base64Content,
                    encoding: "base64"
                }, pat);

                const treeItems = [{
                    path: fileNameFull,
                    mode: "100644",
                    type: "blob",
                    sha: blobData.sha
                }];

                // 4. Create new tree
                updateFileProgress(i, 70, 'Đang tạo tree mới...');
                const newTreeData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/trees`, 'POST', {
                    base_tree: baseTreeSha,
                    tree: treeItems
                }, pat);

                // 5. Create new commit
                updateFileProgress(i, 85, 'Đang tạo commit...');
                const newCommitData = await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/commits`, 'POST', {
                    message: `Add ${fileNameFull} via Git Upload 27NetTeam`,
                    tree: newTreeData.sha,
                    parents: [latestCommitSha]
                }, pat);

                // 6. Push
                updateFileProgress(i, 95, 'Đang push lên GitHub...');
                await githubRequest(`https://api.github.com/repos/${username}/${actualRepoName}/git/refs/heads/${defaultBranch}`, 'PATCH', {
                    sha: newCommitData.sha
                }, pat);

                // Done!
                updateFileProgress(i, 100, '✅ Hoàn thành!');
                setFileStatus(i, 'done');
                data.repoUrl = repoUrl; // Save repoUrl for pushing to Google Sheets
                
                // Show result link
                resultSection.classList.remove('hidden');
                resultLinks.value += (resultLinks.value ? "\n" : "") + repoUrl;

            } catch (fileError) {
                console.error(`Error for file ${fileNameFull}:`, fileError);
                updateFileProgress(i, 100, '❌ Lỗi!');
                setFileStatus(i, 'error', fileError.message);
            }
        }

        // Show success modal if there are links
        if (resultLinks.value.trim() !== "") {
            if (successLinksTextarea) {
                successLinksTextarea.value = resultLinks.value;
            }
            if (successModal) {
                successModal.classList.remove('hidden');
            }
        }

    } catch (error) {
        console.error(error);
        showPopup(`Lỗi: ${error.message}`);
    } finally {
        isUploading = false;
        btnStart.disabled = false;
        // Re-enable inputs
        document.querySelectorAll('.file-card-suffix input').forEach(input => {
            input.disabled = false;
        });
    }
}

// Version Display
const appVersionElement = document.getElementById('app-version');
if (appVersionElement) {
    appVersionElement.innerText = "phiên bản : JS-V3.1";
}

// Document Title Typewriter Effect
const titleTexts = [
    "Git Upload",
    "Công cụ đẩy bài tập code tự động",
    "27NetTeam X RAIA RIKKEI"
];
let titleIndex = 0;
let titleTextIndex = 0;
let titleIsDeleting = false;

function titleTypeWriter() {
    const currentText = titleTexts[titleTextIndex];
    
    if (titleIsDeleting) {
        document.title = currentText.substring(0, titleIndex - 1) || "\u200E";
        titleIndex--;
    } else {
        document.title = currentText.substring(0, titleIndex + 1);
        titleIndex++;
    }

    let typeSpeed = titleIsDeleting ? 50 : 150;

    if (!titleIsDeleting && titleIndex === currentText.length) {
        typeSpeed = 2000; // Wait before deleting
        titleIsDeleting = true;
    } else if (titleIsDeleting && titleIndex === 0) {
        titleIsDeleting = false;
        titleTextIndex = (titleTextIndex + 1) % titleTexts.length;
        typeSpeed = 500; // Wait before typing next
    }
    setTimeout(titleTypeWriter, typeSpeed);
}

// Start the title effect
titleTypeWriter();

// Google Sheets & Google OAuth Integration
const btnLoginGoogle = document.getElementById('btn-login-google');
const btnPushGsheet = document.getElementById('btn-push-gsheet');
const googleAuthMsg = document.getElementById('google-auth-msg');

const GOOGLE_CLIENT_ID = '1078257862435-df8m68qv08re9q7um4hp5htm8indl6k6.apps.googleusercontent.com'; 
let googleAccessToken = null;
let tokenClient;

window.addEventListener('DOMContentLoaded', () => {
    // Không khởi tạo ngay ở đây vì file script của Google dùng thuộc tính async defer
    // Có thể nó chưa tải xong lúc DOMContentLoaded
});

async function handleGoogleLogin() {
    // Nếu chưa khởi tạo tokenClient thì thử khởi tạo lại
    if (!tokenClient && typeof google !== 'undefined' && google.accounts) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    const grantedScopes = tokenResponse.scope || '';
                    if (!grantedScopes.includes('drive.file') || !grantedScopes.includes('spreadsheets')) {
                        showPopup("Bạn phải tích chọn CẤP QUYỀN truy cập Google Drive và Google Sheets ở màn hình đăng nhập thì hệ thống mới có thể tạo file được. Vui lòng thử đăng nhập lại!");
                        return;
                    }
                    
                    googleAccessToken = tokenResponse.access_token;
                    // Chuyển UI nút Google trong modal nếu có
                    if(btnLoginGoogle) btnLoginGoogle.classList.add('hidden');
                    if(btnPushGsheet) btnPushGsheet.classList.remove('hidden');
                    if(googleAuthMsg) {
                        googleAuthMsg.classList.add('hidden');
                    }

                    // Chuyển UI Google trên header
                    const googleLoggedOut = document.getElementById('google-logged-out');
                    const googleLoggedIn = document.getElementById('google-logged-in');
                    if (googleLoggedOut) googleLoggedOut.classList.add('hidden');
                    if (googleLoggedIn) googleLoggedIn.classList.remove('hidden');
                    
                    // Lấy thông tin user profile
                    try {
                        const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + googleAccessToken);
                        const userInfo = await res.json();
                        
                        const googleAvatar = document.getElementById('google-avatar');
                        const googleName = document.getElementById('google-name');
                        
                        if (googleAvatar && googleName && userInfo && userInfo.picture) {
                            googleAvatar.src = userInfo.picture;
                            googleName.innerText = userInfo.name || userInfo.email || 'Google User';
                        }
                        
                        // Lưu vào localStorage để F5 không mất
                        localStorage.setItem('googleAccessToken', googleAccessToken);
                        localStorage.setItem('googleUserInfo', JSON.stringify(userInfo));
                    } catch (e) {
                        console.error("Lỗi lấy thông tin Google Profile:", e);
                    }
                }
            },
        });
    }

    if (!tokenClient) {
        showPopup("Thư viện Google chưa tải xong hoặc mạng có vấn đề. Vui lòng thử lại sau vài giây.");
        return;
    }
    
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        showPopup("Admin chưa cấu hình GOOGLE_CLIENT_ID trong script.js!");
        return;
    }
    
    // Gọi popup đăng nhập
    tokenClient.requestAccessToken({prompt: 'consent'});
}

// Khôi phục trạng thái Google Auth khi F5
function restoreGoogleAuth() {
    const savedToken = localStorage.getItem('googleAccessToken');
    const savedUserInfoStr = localStorage.getItem('googleUserInfo');
    
    if (savedToken && savedUserInfoStr) {
        googleAccessToken = savedToken;
        try {
            const userInfo = JSON.parse(savedUserInfoStr);
            
            // Chuyển UI nút Google trong modal nếu có
            if(btnLoginGoogle) btnLoginGoogle.classList.add('hidden');
            if(btnPushGsheet) btnPushGsheet.classList.remove('hidden');
            if(googleAuthMsg) {
                googleAuthMsg.classList.add('hidden');
            }

            // Chuyển UI Google trên header
            const googleLoggedOut = document.getElementById('google-logged-out');
            const googleLoggedIn = document.getElementById('google-logged-in');
            if (googleLoggedOut) googleLoggedOut.classList.add('hidden');
            if (googleLoggedIn) googleLoggedIn.classList.remove('hidden');
            
            const googleAvatar = document.getElementById('google-avatar');
            const googleName = document.getElementById('google-name');
            
            if (googleAvatar && googleName && userInfo && userInfo.picture) {
                googleAvatar.src = userInfo.picture;
                googleName.innerText = userInfo.name || userInfo.email || 'Google User';
            }
        } catch(e) {
            console.error("Lỗi parse googleUserInfo", e);
        }
    }
}
// Chạy hàm khôi phục
restoreGoogleAuth();

if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', handleGoogleLogin);
}

const btnHeaderGoogleLogin = document.getElementById('btn-header-google-login');
if (btnHeaderGoogleLogin) {
    btnHeaderGoogleLogin.addEventListener('click', handleGoogleLogin);
}

const btnGoogleLogout = document.getElementById('btn-google-logout');
const googleLogoutConfirmModal = document.getElementById('google-logout-confirm-modal');
const btnConfirmGoogleLogout = document.getElementById('btn-confirm-google-logout');
const btnCancelGoogleLogout = document.getElementById('btn-cancel-google-logout');

if (btnGoogleLogout && googleLogoutConfirmModal) {
    btnGoogleLogout.addEventListener('click', () => {
        googleLogoutConfirmModal.classList.remove('hidden');
    });

    if (btnCancelGoogleLogout) {
        btnCancelGoogleLogout.addEventListener('click', () => {
            googleLogoutConfirmModal.classList.add('hidden');
        });
    }

    if (btnConfirmGoogleLogout) {
        btnConfirmGoogleLogout.addEventListener('click', () => {
            googleAccessToken = null;
            localStorage.removeItem('googleAccessToken');
            localStorage.removeItem('googleUserInfo');
            
            const googleLoggedOut = document.getElementById('google-logged-out');
            const googleLoggedIn = document.getElementById('google-logged-in');
            if (googleLoggedOut) googleLoggedOut.classList.remove('hidden');
            if (googleLoggedIn) googleLoggedIn.classList.add('hidden');
            
            if(btnLoginGoogle) btnLoginGoogle.classList.remove('hidden');
            if(btnPushGsheet) btnPushGsheet.classList.add('hidden');
            if(googleAuthMsg) {
                googleAuthMsg.classList.remove('hidden');
            }
            
            googleLogoutConfirmModal.classList.add('hidden');
        });
    }
}

async function executePushToGoogleSheets(btnElement) {
    if (!googleAccessToken) {
        showPopup("Vui lòng đăng nhập Google trước!");
        return;
    }

    // Collect data
    const pushData = [];
    for (let i = 0; i < currentFilesData.length; i++) {
        const data = currentFilesData[i];
        if (data.repoUrl) {
            pushData.push([
                data.customBaseName || data.originalBaseName,
                data.repoUrl
            ]);
        }
    }
    
    if (pushData.length === 0) {
        showPopup("Không có link repo nào để đẩy! Vui lòng upload code trước.");
        return;
    }

    const originalText = btnElement.innerHTML;
    btnElement.disabled = true;
    btnElement.innerHTML = `
        <svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite; width: 16px; height: 16px; display: inline-block; vertical-align: middle;"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/></svg>
        Đang tạo file...
    `;

    try {
        // 1. Tạo mới Spreadsheet
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: `[Git Upload] Danh Sách Repo - ${new Date().toLocaleString('vi-VN')}`
                }
            })
        });

        if (!createRes.ok) {
            const errData = await createRes.json();
            let errMsg = errData.error?.message || createRes.statusText;
            if (errMsg.includes("insufficient authentication scopes")) {
                errMsg = "Thiếu quyền truy cập. Bạn cần Đăng xuất Google và Đăng nhập lại, nhớ tích chọn CẤP QUYỀN Drive và Sheets.";
            } else if (errMsg.includes("Request is missing required authentication credential") || errMsg.includes("Invalid Credentials")) {
                errMsg = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.";
            }
            throw new Error("Lỗi tạo Sheet: " + errMsg);
        }
        const sheetData = await createRes.json();
        const spreadsheetId = sheetData.spreadsheetId;
        const sheetUrl = sheetData.spreadsheetUrl;

        // 2. Ghi dữ liệu vào Spreadsheet
        const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [
                    ["Bài", "Link Repository"], // Header
                    ...pushData
                ]
            })
        });

        if (!writeRes.ok) {
            const errData = await writeRes.json();
            throw new Error("Lỗi ghi dữ liệu: " + (errData.error?.message || writeRes.statusText));
        }

        // Thành công
        btnElement.innerHTML = `✅ Đã tạo thành công`;
        btnElement.style.backgroundColor = 'var(--neon-green)';
        btnElement.style.color = '#000';
        
        // Mở tab mới
        window.open(sheetUrl, '_blank');

        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.backgroundColor = '';
            btnElement.style.color = '';
            btnElement.disabled = false;
        }, 3000);

    } catch (error) {
        console.error("Lỗi Google Sheets:", error);
        showPopup(error.message);
        btnElement.innerHTML = `❌ Lỗi`;
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.disabled = false;
        }, 3000);
    }
}

if (btnPushGsheet) {
    btnPushGsheet.addEventListener('click', () => executePushToGoogleSheets(btnPushGsheet));
}

const btnResultPushGsheet = document.getElementById('btn-result-push-gsheet');
if (btnResultPushGsheet) {
    btnResultPushGsheet.addEventListener('click', () => executePushToGoogleSheets(btnResultPushGsheet));
}


