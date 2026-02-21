// APP PRINCIPAL RATTO HUB

// Render games
function renderGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    GAMES.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => showScripts(game);
        
        card.innerHTML = `
            <div class="game-content">
                <div class="game-icon">${game.icon}</div>
                <div class="game-title">${game.name}</div>
                <div class="game-players">
                    <i class="fas fa-users"></i> ${game.players}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Mostrar scripts do jogo
function showScripts(game) {
    const main = document.querySelector('.main .container');
    
    // Pegar os 22 scripts do jogo
    const gameScripts = ALL_SCRIPTS[game.id] || [];
    const userScripts = JSON.parse(localStorage.getItem('userScripts') || '[]')
        .filter(s => s.gameId === game.id);
    
    main.innerHTML = `
        <button class="btn-back" onclick="location.reload()">
            <i class="fas fa-arrow-left"></i> Voltar
        </button>
        
        <h1 class="page-title">${game.icon} ${game.name}</h1>
        <p class="subtitle">${gameScripts.length} scripts oficiais disponíveis</p>
        
        <div class="scripts-container">
            <!-- Scripts Oficiais (22) -->
            <h2 class="section-title">⭐ Scripts Oficiais</h2>
            <div class="scripts-grid-list">
                ${gameScripts.map(script => `
                    <div class="script-card-mini">
                        <div class="script-info">
                            <h4>${script.name}</h4>
                            <p>${script.code.split('\n')[0].replace('--', '').trim()}</p>
                            <div class="script-meta">
                                <span><i class="fas fa-download"></i> ${(script.downloads/1000).toFixed(1)}k</span>
                                <span><i class="fas fa-star"></i> ${script.rating}</span>
                            </div>
                        </div>
                        <div class="script-actions-mini">
                            <button class="btn-view-sm" onclick='viewScriptById("${script.id}")'>
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-copy-sm" onclick='copyScriptById("${script.id}")'>
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Scripts da Comunidade -->
            <h2 class="section-title">👥 Scripts da Comunidade</h2>
            <div class="community-scripts" id="community-scripts">
                ${userScripts.length === 0 ? 
                    '<p class="no-scripts">Nenhum script postado ainda. Seja o primeiro!</p>' :
                    userScripts.map(s => `
                        <div class="script-card">
                            <h4>${s.name}</h4>
                            <p>Por: ${s.author}</p>
                            <button class="btn-view-sm" onclick="viewUserScript(${s.id})">
                                Ver Script
                            </button>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

// Ver script por ID
function viewScriptById(scriptId) {
    const [gameId, scriptIndex] = scriptId.split('-');
    const script = ALL_SCRIPTS[gameId][parseInt(scriptIndex) - 1];
    if (script) {
        showModal(script.name, script.code);
    }
}

function copyScriptById(scriptId) {
    const [gameId, scriptIndex] = scriptId.split('-');
    const script = ALL_SCRIPTS[gameId][parseInt(scriptIndex) - 1];
    if (script) {
        navigator.clipboard.writeText(script.code).then(() => {
            showNotification('✅ Script copiado!', 'success');
        });
    }
}

// Ver script
function viewScript(gameId, type) {
    const script = REAL_SCRIPTS[gameId];
    showModal('Script Oficial', script);
}

function viewUserScript(scriptId) {
    const scripts = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
        showModal(script.name, script.code);
    }
}

// Copiar script
function copyScript(gameId) {
    const script = REAL_SCRIPTS[gameId];
    navigator.clipboard.writeText(script).then(() => {
        showNotification('✅ Script copiado!', 'success');
    });
}

// Modal de visualização
function showModal(title, code) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-code"></i> ${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <pre><code>${code}</code></pre>
            </div>
            <div class="modal-footer">
                <button class="btn-copy-modal" onclick="copyFromModal(this)">
                    <i class="fas fa-copy"></i> Copiar Script
                </button>
                <button class="btn-download-modal" onclick="downloadScript('${title}', \`${code}\`)">
                    <i class="fas fa-download"></i> Baixar .lua
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function copyFromModal(btn) {
    const code = btn.closest('.modal-container').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('✅ Script copiado!', 'success');
    });
}

function downloadScript(name, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.lua`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✅ Download iniciado!', 'success');
}

// Notificações
function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: linear-gradient(135deg, #00aaff, #0080ff);
        color: #fff;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Pesquisa
const searchInput = document.getElementById('search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });
}

// Estilos adicionais
const style = document.createElement('style');
style.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    }
    
    .modal-container {
        background: #0f1229;
        border: 2px solid #00aaff;
        border-radius: 16px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid rgba(0, 170, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        color: #00aaff;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
    }
    
    .modal-body {
        flex: 1;
        overflow: auto;
        padding: 20px;
    }
    
    .modal-body pre {
        background: #0a0e27;
        padding: 20px;
        border-radius: 8px;
        overflow: auto;
    }
    
    .modal-body code {
        color: #00aaff;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.6;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid rgba(0, 170, 255, 0.2);
        display: flex;
        gap: 10px;
    }
    
    .btn-copy-modal,
    .btn-download-modal {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
    }
    
    .btn-copy-modal {
        background: rgba(0, 170, 255, 0.2);
        border: 1px solid #00aaff;
        color: #00aaff;
    }
    
    .btn-download-modal {
        background: linear-gradient(135deg, #00aaff, #0080ff);
        color: #fff;
    }
    
    .btn-back {
        padding: 12px 24px;
        background: rgba(0, 170, 255, 0.1);
        border: 1px solid #00aaff;
        border-radius: 8px;
        color: #00aaff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        font-weight: 600;
    }
    
    .page-title {
        font-size: 36px;
        margin-bottom: 30px;
        background: linear-gradient(135deg, #00aaff, #0080ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .script-official {
        background: linear-gradient(135deg, rgba(0, 170, 255, 0.1), rgba(0, 128, 255, 0.05));
        border: 2px solid #00aaff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
    }
    
    .script-badge {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #000;
        padding: 5px 15px;
        border-radius: 20px;
        display: inline-block;
        font-weight: 700;
        margin-bottom: 15px;
    }
    
    .script-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .btn-view,
    .btn-copy {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-view {
        background: linear-gradient(135deg, #00aaff, #0080ff);
        color: #fff;
    }
    
    .btn-copy {
        background: rgba(0, 170, 255, 0.2);
        border: 1px solid #00aaff;
        color: #00aaff;
    }
    
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar
renderGames();
