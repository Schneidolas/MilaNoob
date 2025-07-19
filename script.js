// -----------------------------------------------------------------
// CONFIGURE AQUI!
// Substitua com seu nome de usuário, nome do repositório e a pasta.
const GITHUB_USER = 'SEU_NOME_DE_USUARIO';
const REPO_NAME = 'NOME_DO_SEU_REPOSITORIO';
const IMAGE_FOLDER = 'referencias';
// -----------------------------------------------------------------

const sidebar = document.getElementById('sidebar');
const imageDisplay = document.getElementById('image-display');
const placeholderText = document.getElementById('placeholder-text');

// Função para exibir a imagem clicada
function displayImage(imageUrl) {
    placeholderText.style.display = 'none';
    imageDisplay.style.display = 'block';
    imageDisplay.src = imageUrl;
}

/**
 * Função recursiva que busca arquivos e pastas na API do GitHub
 * e constrói a árvore de arquivos na barra lateral.
 * @param {string} path - O caminho da pasta a ser buscada.
 * @param {HTMLElement} parentElement - O elemento HTML onde os itens serão adicionados.
 */
async function buildFileTree(path, parentElement) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${path}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na API do GitHub: ${response.statusText}`);
        }
        const items = await response.json();

        // Limpa a mensagem de "Carregando..."
        if (path === IMAGE_FOLDER) {
            parentElement.innerHTML = '';
        }

        // Ordena para que as pastas apareçam antes dos arquivos
        items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        });
        
        for (const item of items) {
            if (item.type === 'dir') {
                // É uma pasta
                const folderDiv = document.createElement('div');
                folderDiv.className = 'folder';
                folderDiv.textContent = item.name;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'folder-content';
                contentDiv.style.display = 'none'; // Começa fechado

                folderDiv.onclick = () => {
                    // Alterna a visibilidade do conteúdo da pasta
                    const isVisible = contentDiv.style.display === 'block';
                    contentDiv.style.display = isVisible ? 'none' : 'block';
                    // Se for a primeira vez abrindo, busca o conteúdo
                    if (!isVisible && contentDiv.innerHTML === '') {
                        buildFileTree(item.path, contentDiv);
                    }
                };

                parentElement.appendChild(folderDiv);
                parentElement.appendChild(contentDiv);

            } else if (item.name.toLowerCase().endsWith('.png')) {
                // É um arquivo .png
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file';
                fileDiv.textContent = item.name;
                fileDiv.onclick = () => displayImage(item.download_url);
                parentElement.appendChild(fileDiv);
            }
        }

    } catch (error) {
        console.error('Falha ao buscar a árvore de arquivos:', error);
        parentElement.innerHTML = `<p style="color: red;">Erro ao carregar arquivos. Verifique o console (F12) e as configurações no script.js.</p>`;
    }
}

// Inicia o processo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    buildFileTree(IMAGE_FOLDER, sidebar);
});
