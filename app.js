// APP PRINCIPAL RATTO HUB - JOGOS SEMPRE VISÍVEIS

// Render games - EXECUTA AUTOMATICAMENTE
function renderGames() {
    const grid = document.getElementById('games-grid');
    if (!grid) {
        console.log('❌ Grid não encontrado, tentando novamente...');
        return;
    }

    // Limpar grid
    grid.innerHTML = '';

    if (!GAMES || GAMES.length === 0) {
        console.log('❌ GAMES não carregado!');
        grid.innerHTML = '<p style="color: #fff; text-align: center;">Carregando jogos...</p>';
        return;
    }

    console.log(`🎮 Renderizando ${GAMES.length} jogos...`);

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
    
    console.log(`✅ ${GAMES.length} jogos renderizados!`);
}

// Mostrar scripts do jogo
function showScripts(game) {
    const mainContainer = document.getElementById('main-container');
    
    // Verificar se ALL_SCRIPTS existe
    if (!ALL_SCRIPTS || !ALL_SCRIPTS[game.id]) {
        alert('Scripts não carregados. Recarregue a página.');
        return;
    }
    
    // Pegar os 22 scripts do jogo
    const gameScripts = ALL_SCRIPTS[game.id];
    const userScripts = JSON.parse(localStorage.getItem('userScripts') || '[]')
        .filter(s => s.gameId === game.id);
    
    mainContainer.innerHTML = `
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
            <div class="community-scripts">
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
        }).catch(() => {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = script.code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('✅ Script copiado!', 'success');
        });
    }
}

function viewUserScript(scriptId) {
    const scripts = JSON.parse(localStorage.getItem('userScripts') || '[]');
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
        showModal(script.name, script.code);
    }
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
                <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            </div>
            <div class="modal-footer">
                <button class="btn-copy-modal" onclick="copyFromModal(this)">
                    <i class="fas fa-copy"></i> Copiar Script
                </button>
                <button class="btn-download-modal" onclick="downloadScript('${title.replace(/'/g, "\\'")}', \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
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
    }).catch(() => {
        showNotification('❌ Erro ao copiar', 'error');
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
        box-shadow: 0 10px 30px rgba(0,170,255,0.3);
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Pesquisa - OPCIONAL
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
        background: rgba(0, 0, 0, 0.95);
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
        max-width: 900px;
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
        font-size: 20px;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.3s;
    }
    
    .modal-close:hover {
        background: rgba(255,0,0,0.2);
    }
    
    .modal-body {
        flex: 1;
        overflow: auto;
        padding: 20px;
    }
    
    .modal-body pre {
        background: #0a0e27;
        padding: 20px;
        border-radius: 12px;
        overflow: auto;
        border: 1px solid rgba(0,170,255,0.2);
    }
    
    .modal-body code {
        color: #00aaff;
        font-family: 'Courier New', 'Consolas', monospace;
        font-size: 13px;
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
        padding: 14px 20px;
        border: none;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
        font-size: 15px;
    }
    
    .btn-copy-modal {
        background: rgba(0, 170, 255, 0.2);
        border: 2px solid #00aaff;
        color: #00aaff;
    }
    
    .btn-copy-modal:hover {
        background: rgba(0, 170, 255, 0.3);
        transform: translateY(-2px);
    }
    
    .btn-download-modal {
        background: linear-gradient(135deg, #00aaff, #0080ff);
        color: #fff;
        border: 2px solid transparent;
    }
    
    .btn-download-modal:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0,170,255,0.4);
    }
    
    .btn-back {
        padding: 12px 24px;
        background: rgba(0, 170, 255, 0.1);
        border: 1px solid #00aaff;
        border-radius: 10px;
        color: #00aaff;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        font-weight: 600;
        transition: all 0.3s;
    }
    
    .btn-back:hover {
        background: rgba(0, 170, 255, 0.2);
        transform: translateX(-5px);
    }
    
    .page-title {
        font-size: 40px;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #00aaff, #0080ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
    }
    
    .no-scripts {
        color: #8b9dc3;
        text-align: center;
        padding: 40px;
        font-size: 16px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    @media (max-width: 768px) {
        .modal-container {
            max-height: 95vh;
        }
        
        .modal-body code {
            font-size: 12px;
        }
        
        .page-title {
            font-size: 28px;
        }
    }
`;
document.head.appendChild(style);

// INICIALIZAR - MÚLTIPLAS TENTATIVAS
let initAttempts = 0;
const maxAttempts = 10;

function tryInit() {
    initAttempts++;
    console.log(`🔄 Tentativa ${initAttempts} de inicializar...`);
    
    if (typeof GAMES !== 'undefined' && GAMES.length > 0) {
        console.log('✅ GAMES carregado!');
        renderGames();
        return true;
    }
    
    if (initAttempts < maxAttempts) {
        console.log('⏳ Aguardando GAMES carregar...');
        setTimeout(tryInit, 100);
    } else {
        console.log('❌ Falha ao carregar GAMES após 10 tentativas');
        const grid = document.getElementById('games-grid');
        if (grid) {
            grid.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 40px;">Erro ao carregar jogos. Recarregue a página.</p>';
        }
    }
}

// Iniciar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
} else {
    tryInit();
}

console.log('🚀 Ratto Hub App.js carregado!');
                                   
