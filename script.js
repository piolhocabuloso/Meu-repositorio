document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        DISCORD_USER_ID: '1316224002334654494',
        SPOTIFY_CLIENT_ID: '2fd82ac55c834a4887de4f30c0387c4d',
        DISCORD_BOT_TOKEN: null,
        UPDATE_INTERVAL: 30000,
        SPOTIFY_UPDATE_INTERVAL: 5000,
        EMAIL: 'edgardsouza176@gmail.com' 
    };
    
    const cursor = document.querySelector('.cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
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
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    
        document.addEventListener('mouseover', (e) => {
            const isClickable = e.target.closest('a, button, .social-link, .widget, [role="button"], input, textarea, [onclick]');
            if (isClickable) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        });
    }
    
    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
    
    async function updateDiscordStatus() {
        console.log('🔄 Atualização de status do Discord...');
        
        try {
            const lanyardResponse = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`);
            
            if (lanyardResponse.ok) {
                const lanyardData = await lanyardResponse.json();
                console.log('✅ Dados do cordão recebidos:', lanyardData);
                
                if (lanyardData.success && lanyardData.data) {
                    updateDiscordUI(lanyardData.data);
                    return;
                }
            }
            
            const lookupResponse = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${CONFIG.DISCORD_USER_ID}`);
            
            if (lookupResponse.ok) {
                const lookupData = await lookupResponse.json();
                console.log('✅ Dados de pesquisa do Discord recebidos:', lookupData);
                updateDiscordUIFromLookup(lookupData);
                return;
            }
            
            const discordResponse = await fetch(`https://discord.com/api/v10/users/${CONFIG.DISCORD_USER_ID}`);
            
            if (discordResponse.ok) {
                const discordData = await discordResponse.json();
                console.log('✅ Dados da API do Discord recebidos:', discordData);
                updateDiscordUIFromAPI(discordData);
                return;
            }
            
        } catch (error) {
            console.error('❌ Erro ao recuperar dados do Discord:', error);
        }
        
        updateDiscordOffline();
    }
    
    function updateDiscordUI(userData) {
        if (window.lastDiscordUpdate && Date.now() - window.lastDiscordUpdate < 5000) {
            return;
        }
        window.lastDiscordUpdate = Date.now();
        
        console.log('🎨 Atualização da interface do usuário do Discord com Lanyard:', userData);
        
        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');
        const status = document.getElementById('main-status');
        const statusDot = document.getElementById('discord-status-dot');
        const activity = document.getElementById('discord-activity');
        const activityImage = document.getElementById('activity-image');
        
        if (userData.discord_user) {
            const avatarUrl = userData.discord_user.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=128`
                : `https://cdn.discordapp.com/embed/avatars/${(parseInt(userData.discord_user.discriminator) || 0) % 5}.png`;
            
            if (avatar) avatar.src = avatarUrl;
            if (mainAvatar) mainAvatar.src = avatarUrl;
            
            const discordUsername = userData.discord_user.username || 'c';
            if (username) username.textContent = '@' + discordUsername;
            
            if (status) {
                const statusClass = userData.discord_status || 'offline';
                status.className = `status-indicator ${statusClass}`;
            }
            
            if (statusDot) {
                const statusClass = userData.discord_status || 'offline';
                statusDot.className = `status-dot ${statusClass}`;
            }
            
            if (activity) {
                if (userData.activities && userData.activities.length > 0) {
                    const filteredActivities = userData.activities.filter(a => 
                        a.type !== 4 &&
                        a.name !== 'Spotify' &&
                        !a.name.toLowerCase().includes('spotify')
                    );
                    
                    if (filteredActivities.length > 0) {
                        const currentActivity = filteredActivities[0];
                        
                        let activityText = '';
                        
                        switch (currentActivity.type) {
                            case 0:
                                activityText = `🎮 Joue à ${currentActivity.name}`;
                                if (currentActivity.details) {
                                    activityText += ` - ${currentActivity.details}`;
                                }
                                if (activityImage && currentActivity.assets && currentActivity.assets.large_image) {
                                    const imageUrl = currentActivity.assets.large_image.startsWith('mp:')
                                        ? `https://media.discordapp.net/${currentActivity.assets.large_image.slice(3)}`
                                        : `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${currentActivity.assets.large_image}.png`;
                                    activityImage.src = imageUrl;
                                    activityImage.style.display = 'block';
                                } else if (activityImage) {
                                    activityImage.style.display = 'none';
                                }
                                break;
                            case 1:
                                activityText = `🔴 Stream ${currentActivity.name}`;
                                if (activityImage) activityImage.style.display = 'none';
                                break;
                            case 2:
                                activityText = `🎵 Écoute ${currentActivity.name}`;
                                if (activityImage) activityImage.style.display = 'none';
                                break;
                            case 3:
                                activityText = `📺 Regarde ${currentActivity.name}`;
                                if (activityImage) activityImage.style.display = 'none';
                                break;
                            default:
                                activityText = currentActivity.name;
                                if (activityImage) activityImage.style.display = 'none';
                        }
                        
                        activity.textContent = activityText;
                    } else {
                        activity.textContent = 'Aucune activité';
                        if (activityImage) activityImage.style.display = 'none';
                    }
                } else {
                    activity.textContent = 'Aucune activité';
                    if (activityImage) activityImage.style.display = 'none';
                }
            }
            
            if (userData.spotify) {
                updateSpotifyFromDiscord(userData.spotify);
            } else {
                updateSpotifyFromDiscord(null);
            }
        }
    }
    
    function updateDiscordUIFromLookup(userData) {
        console.log('🎨 Mise à jour UI Discord avec Lookup:', userData);
        
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
        
        if (username) username.textContent = '@' + (userData.username || 'c');
        if (status) status.className = 'status-indicator online';
        if (statusDot) statusDot.className = 'status-dot online';
        if (activity) activity.textContent = 'online';
    }
    
    function updateDiscordUIFromAPI(userData) {
        console.log('🎨 Mise à jour UI Discord avec API:', userData);
        
        const avatar = document.getElementById('discord-avatar');
        const mainAvatar = document.getElementById('main-avatar');
        const username = document.getElementById('discord-username');
        
        const avatarUrl = userData.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${(parseInt(userData.discriminator) || 0) % 5}.png`;
        
        if (avatar) avatar.src = avatarUrl;
        if (mainAvatar) mainAvatar.src = avatarUrl;
        
        if (username) username.textContent = '@' + (userData.username || 'c');
    }
    
    function updateDiscordOffline() {
        console.log('😴 Mode Discord hors ligne');
        
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
        
        if (username) username.textContent = '@c';
        if (status) status.className = 'status-indicator offline';
        if (statusDot) statusDot.className = 'status-dot offline';
        if (activity) activity.textContent = 'Hors ligne';
        if (activityImage) activityImage.style.display = 'none';
    }
    
    function updateSpotifyFromDiscord(spotifyData) {
        const trackName = document.getElementById('spotify-track');
        const artistName = document.getElementById('spotify-artist');
        const albumArt = document.getElementById('spotify-album');
        const statusDot = document.querySelector('.spotify-widget .status-dot');
        
        if (spotifyData && spotifyData.song) {
            if (trackName) trackName.textContent = spotifyData.song;
            if (artistName) artistName.textContent = spotifyData.artist || '-';
            if (statusDot) statusDot.className = 'status-dot playing';
            
            if (albumArt && spotifyData.album_art_url) {
                albumArt.src = spotifyData.album_art_url;
                albumArt.style.display = 'block';
            } else if (albumArt) {
                albumArt.style.display = 'none';
            }
        } else {
            if (trackName) trackName.textContent = 'Não está ouvindo';
            if (artistName) artistName.textContent = '-';
            if (albumArt) albumArt.style.display = 'none';
            if (statusDot) statusDot.className = 'status-dot offline';
        }
    }
    
    async function updateSpotifyStatus() {
        try {
            const token = localStorage.getItem('spotify_access_token');
            
            if (!token) {
                return;
            }
            
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok && response.status !== 204) {
                const data = await response.json();
                updateSpotifyUI(data);
            } else if (response.status === 401) {
                localStorage.removeItem('spotify_access_token');
                console.log('Token Spotify expiré');
            } else {
                updateSpotifyUI(null);
            }
        } catch (error) {
            console.log('Erreur API Spotify:', error);
            updateSpotifyUI(null);
        }
    }
    
    function updateSpotifyUI(data) {
        const trackName = document.getElementById('spotify-track');
        const artistName = document.getElementById('spotify-artist');
        const albumArt = document.getElementById('spotify-album');
        const statusDot = document.querySelector('.spotify-widget .status-dot');
        
        if (data && data.is_playing && data.item) {
            if (trackName) trackName.textContent = data.item.name;
            if (artistName) artistName.textContent = data.item.artists.map(artist => artist.name).join(', ');
            if (statusDot) statusDot.className = 'status-dot playing';
            
            if (albumArt && data.item.album && data.item.album.images && data.item.album.images.length > 0) {
                albumArt.src = data.item.album.images[0].url;
                albumArt.style.display = 'block';
            } else if (albumArt) {
                albumArt.style.display = 'none';
            }
        } else {
            if (trackName) trackName.textContent = 'Não está ouvindo';
            if (artistName) artistName.textContent = '-';
            if (albumArt) albumArt.style.display = 'none';
            if (statusDot) statusDot.className = 'status-dot offline';
        }
    }
    
    function initSpotifyAuth() {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            localStorage.setItem('spotify_access_token', accessToken);
            window.location.hash = '';
        }
    }
    
    function authenticateSpotify() {
        const scopes = 'user-read-currently-playing user-read-playback-state';
        const redirectUri = window.location.origin + window.location.pathname;
        
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${CONFIG.SPOTIFY_CLIENT_ID}&` +
            `response_type=token&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scopes)}`;
        
        window.location.href = authUrl;
    }
    
    const discordLink = document.getElementById('discord-social-link');
    console.log('Discord link found:', discordLink); 
    if (discordLink) {
        discordLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Discord clicked!'); 
            copyDiscordUsername();
        });
    }
    
    const emailLink = document.getElementById('email-link');
    console.log('Email link found:', emailLink); 
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Email clicked!');
            copyEmailToClipboard();
        });
    }
    const spotifyLinks = document.querySelectorAll('.social-link[href="#"]:has(i.fa-spotify)');
    spotifyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!localStorage.getItem('spotify_access_token')) {
                authenticateSpotify();
            } else {
                window.open('https://open.spotify.com/', '_blank');
            }
        });
    });
    

    

    function showNotification(message) {
        console.log('Showing notification:', message);
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            console.error('Notification element not found!');
        }
    }
    
    function copyEmail() {
        const email = CONFIG.EMAIL || 'contact@exemple.com';
        console.log('Copying email:', email);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
                showNotification(`Email copié : ${email}`);
            }).catch(err => {
                console.error('Clipboard error:', err);
                showNotification('❌ Erreur lors de la copie');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification(`Email copié : ${email}`);
            } catch (err) {
                showNotification('❌ Erreur lors de la copie');
            }
            document.body.removeChild(textArea);
        }
    }
    

    function copyDiscord() {
        const usernameElement = document.getElementById('discord-username');
        let username = '@c';
        
        if (usernameElement && usernameElement.textContent) {
            username = usernameElement.textContent.trim();
        }
        
        console.log('Copying Discord:', username);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(username).then(() => {
                showNotification(`Discord copié : ${username}`);
            }).catch(err => {
                console.error('Clipboard error:', err);
                showNotification('❌ Erreur lors de la copie');
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = username;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification(`Discord copié : ${username}`);
            } catch (err) {
                showNotification('❌ Erreur lors de la copie');
            }
            document.body.removeChild(textArea);
        }
    }
    
    
    const discordBtn = document.querySelector('a[href="#"]:has(i.fa-discord)');
    if (discordBtn) {
        console.log('Discord button found!');
        discordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Discord button clicked!');
            copyDiscord();
        });
    } else {
        console.error('Discord button not found!');
    }
    
    const emailBtn = document.querySelector('a[href="#"]:has(i.fa-envelope)');
    if (emailBtn) {
        console.log('Email button found!');
        emailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Email button clicked!');
            copyEmail();
        });
    } else {
        console.error('Email button not found!');
    }
    

    
    function updateLastSeen() {
        const lastSeenElement = document.getElementById('last-seen');
        if (lastSeenElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            lastSeenElement.textContent = timeString;
        }
    }
    
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            
            if (href) {
                const linkPage = href.split('/').pop();
                
                if (linkPage === currentPage || 
                    (currentPage === '' && linkPage === 'index.html') ||
                    (currentPage === 'index.html' && linkPage === 'index.html')) {
                    item.classList.add('active');
                }
                
                if (currentPage === 'about.html' && linkPage === 'about.html') {
                    item.classList.add('active');
                }
                
                if (currentPage === 'work.html' && linkPage === 'work.html') {
                    item.classList.add('active');
                }
            }
        });
    }

    console.log('🚀 Initialisation du site...');
    
    initSpotifyAuth();
    updateDiscordStatus();
    updateSpotifyStatus();
    updateTime();
    updateLastSeen();
    setActiveNavItem(); 
    
    setInterval(updateDiscordStatus, CONFIG.UPDATE_INTERVAL);
    setInterval(updateSpotifyStatus, CONFIG.SPOTIFY_UPDATE_INTERVAL);
    setInterval(updateTime, 1000);
    setInterval(updateLastSeen, 60000);
    
    console.log('✅ Site chargé avec succès!');
});
    function copyEmailToClipboard() {
        const email = CONFIG.EMAIL;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(() => {
                showNotification(`Email copié : ${email}`);
            }).catch(() => {
                fallbackCopyTextToClipboard(email, 'email');
            });
        } else {
            fallbackCopyTextToClipboard(email, 'email');
        }
    }
    
    function copyDiscordUsername() {
        const usernameElement = document.getElementById('discord-username');
        let currentUsername = '@c'; 
        
        if (usernameElement && usernameElement.textContent) {
            currentUsername = usernameElement.textContent;
            currentUsername = currentUsername.trim();
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentUsername).then(() => {
                showNotification(`Discord copié : ${currentUsername}`);
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
                showNotification(`${type} copié : ${text}`);
            } else {
                showNotification(`Erreur lors de la copie du ${type.toLowerCase()}`);
            }
        } catch (err) {
            showNotification(`Erreur lors de la copie du ${type.toLowerCase()}`);
        }
        
        document.body.removeChild(textArea);
    }
const emailLink = document.getElementById('email-link');
if (emailLink) {
    emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        copyEmailToClipboard();
    });
}
