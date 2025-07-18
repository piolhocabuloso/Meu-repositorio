document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        DISCORD_USER_ID: '1316224002334654494',
        DISCORD_BOT_TOKEN: null,
        UPDATE_INTERVAL: 30000,
        EMAIL: 'edgardsouza176@gmail.com'
    };

    // Cursor customizado
    const cursor = document.querySelector('.cursor');
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            const speed = 0.15;
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        const hoverElements = document.querySelectorAll('a, button, .social-link, .widget, [role="button"], input, textarea');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        document.addEventListener('mouseover', (e) => {
            const isClickable = e.target.closest('a, button, .social-link, .widget, [role="button"], input, textarea, [onclick]');
            if (isClickable) cursor.classList.add('hover');
            else cursor.classList.remove('hover');
        });
    }

    // Atualiza horário e data
    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // Atualiza status Discord
    async function updateDiscordStatus() {
        console.log('🔄 Atualização de status do Discord...');

        try {
            const lanyardResponse = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`);

            if (lanyardResponse.ok) {
                const lanyardData = await lanyardResponse.json();
                if (lanyardData.success && lanyardData.data) {
                    updateDiscordUI(lanyardData.data);
                    return;
                }
            }

            const lookupResponse = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${CONFIG.DISCORD_USER_ID}`);

            if (lookupResponse.ok) {
                const lookupData = await lookupResponse.json();
                updateDiscordUIFromLookup(lookupData);
                return;
            }

            const discordResponse = await fetch(`https://discord.com/api/v10/users/${CONFIG.DISCORD_USER_ID}`);

            if (discordResponse.ok) {
                const discordData = await discordResponse.json();
                updateDiscordUIFromAPI(discordData);
                return;
            }

        } catch (error) {
            console.error('❌ Erro ao recuperar dados do Discord:', error);
        }

        updateDiscordOffline();
    }

    function updateDiscordUIFromLookup(userData) {
        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');
        const status = document.getElementById('main-status');
        const statusDot = document.getElementById('discord-status-dot');
        const activity = document.getElementById('discord-activity');

        const avatarUrl = userData.avatar && userData.avatar.link
            ? userData.avatar.link
            : `https://cdn.discordapp.com/embed/avatars/0.png`;

        if (avatar) avatar.src = avatarUrl;
        if (mainAvatar) mainAvatar.src = avatarUrl;

        if (username) username.textContent = '@' + (userData.username || 'piolhoot');
        if (status) status.className = 'status-indicator online';
        if (statusDot) statusDot.className = 'status-dot online';
        if (activity) activity.textContent = 'online';
    }

    function updateDiscordUIFromAPI(userData) {
        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');

        const avatarUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${(parseInt(userData.discriminator) || 0) % 5}.png`;

        if (avatar) avatar.src = avatarUrl;
        if (mainAvatar) mainAvatar.src = avatarUrl;

        if (username) username.textContent = '@' + (userData.username || 'piolhoot');
    }

    function updateDiscordOffline() {
        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');
        const status = document.getElementById('main-status');
        const statusDot = document.getElementById('discord-status-dot');
        const activity = document.getElementById('discord-activity');
        const activityImage = document.getElementById('activity-image');

        const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
        if (avatar) avatar.src = defaultAvatar;
        if (mainAvatar) mainAvatar.src = defaultAvatar;

        if (username) username.textContent = '@piolhoot';
        if (status) status.className = 'status-indicator offline';
        if (statusDot) statusDot.className = 'status-dot offline';
        if (activity) activity.textContent = 'Offline';
        if (activityImage) activityImage.style.display = 'none';
    }

    // Cópia para área de transferência com notificação
    function showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    function copyEmailToClipboard() {
        const email = CONFIG.EMAIL || 'edgardsouza176@gmail.com';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
                showNotification(`Email copiado: ${email}`);
            }).catch(() => {
                fallbackCopyTextToClipboard(email, 'email');
            });
        } else {
            fallbackCopyTextToClipboard(email, 'email');
        }
    }

    function copyDiscordUsername() {
        const usernameElement = document.getElementById('discord-username');
        let currentUsername = '@piolhoot';
        if (usernameElement && usernameElement.textContent) {
            currentUsername = usernameElement.textContent.trim();
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentUsername).then(() => {
                showNotification(`Discord copiado: ${currentUsername}`);
            }).catch(() => {
                fallbackCopyTextToClipboard(currentUsername, 'Discord');
            });
        } else {
            fallbackCopyTextToClipboard(currentUsername, 'Discord');
        }
    }

    function fallbackCopyTextToClipboard(text, type) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification(`${type} copiado: ${text}`);
            } else {
                showNotification(`Erro ao copiar o ${type.toLowerCase()}`);
            }
        } catch {
            showNotification(`Erro ao copiar o ${type.toLowerCase()}`);
        }
        document.body.removeChild(textArea);
    }

    // Eventos dos links Discord e Email
    const discordLink = document.getElementById('discord-social-link');
    if (discordLink) {
        discordLink.addEventListener('click', (e) => {
            e.preventDefault();
            copyDiscordUsername();
        });
    }

    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            copyEmailToClipboard();
        });
    }

    // Atualiza horário "last seen"
    function updateLastSeen() {
        const lastSeenElement = document.getElementById('last-seen');
        if (lastSeenElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            lastSeenElement.textContent = timeString;
        }
    }

    // Navegação ativa
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href) {
                const linkPage = href.split('/').pop();
                if (linkPage === currentPage ||
                    (currentPage === '' && linkPage === 'index.html') ||
                    (currentPage === 'index.html' && linkPage === 'index.html')) {
                    item.classList.add('active');
                }
            }
        });
    }

    console.log('🚀 Inicializando site...');
    updateDiscordStatus();
    updateTime();
    updateLastSeen();
    setActiveNavItem();

    setInterval(updateDiscordStatus, CONFIG.UPDATE_INTERVAL);
    setInterval(updateTime, 1000);
    setInterval(updateLastSeen, 60000);

    console.log('✅ Site carregado com sucesso!');
});
