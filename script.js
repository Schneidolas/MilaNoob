// =======================================================
// CONFIGURE AQUI SEU USUÁRIO E NOME DO REPOSITÓRIO
// =======================================================
const GITHUB_USER = `https://github.com/Schneidolas/MilaNoob/tree/main`;
const REPO_NAME = "imagens";
// =======================================================

const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/`;
const ROOT_PATH = "imagens"; // Nome da pasta principal de imagens

const fileTreeContainer = document.getElementById('file-tree');
const contentViewer = document.getElementById('content-viewer');

// Função principal que inicia o processo
document.addEventListener('DOMContentLoaded', () => {
    buildFileTree(ROOT_PATH, fileTreeContainer);
});

/**
 * Função recursiva para construir a árvore de arquivos.
 * Ela busca o conteúdo de um caminho e cria os elementos HTML.
 * @param {string} path - O caminho da pasta a ser buscada.
 * @param {HTMLElement} parentElement - O elemento HTML onde a árvore será inserida.
 */
async function buildFileTree(path, parentElement) {
    try {
        const response = await fetch(API_URL + path);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados do GitHub: ${response.statusText}`);
        }
        const items = await response.json();

        // Ordenar para que pastas venham antes de arquivos
        items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        });

        const list = document.createElement('ul');
        if (parentElement !== fileTreeContainer) {
            list.classList.add('collapsible-list');
        }

        for (const item of items) {
            const listItem = document.createElement('li');

            if (item.type === 'dir') {
                // É uma pasta
                const folderItem = document.createElement('div');
                folderItem.textContent = item.name;
                folderItem.classList.add('tree-item', 'folder');
                
                // Adiciona evento para expandir/recolher
                folderItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    folderItem.classList.toggle('expanded');
                });

                listItem.appendChild(folderItem);
                
                // Chama a função recursivamente para o subdiretório
                await buildFileTree(item.path, listItem);

            } else if (item.type === 'file' && item.name.toLowerCase().endsWith('.png')) {
                // É um arquivo .png
                const fileItem = document.createElement('div');
                fileItem.textContent = item.name;
                fileItem.classList.add('tree-item', 'file');

                // Adiciona evento para mostrar a imagem
                fileItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    displayImage(item.download_url);
                });

                listItem.appendChild(fileItem);
            }
            
            // Só adiciona o listItem se ele tiver conteúdo
            if (listItem.children.length > 0) {
                list.appendChild(listItem);
            }
        }
        
        // Adiciona a lista ao elemento pai, evitando que sub-listas vazias sejam adicionadas
        if(list.children.length > 0) {
            parentElement.appendChild(list);
        }

    } catch (error) {
        console.error("Falha ao construir a árvore de arquivos:", error);
        contentViewer.innerHTML = `<div class="placeholder"><p>Erro ao carregar arquivos.<br>Verifique o console e a configuração do repositório.</p></div>`;
    }
}

/**
 * Mostra a imagem selecionada na área de visualização.
 * @param {string} imageUrl - A URL da imagem a ser exibida.
 */
function displayImage(imageUrl) {
    contentViewer.innerHTML = ''; // Limpa o conteúdo anterior
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Imagem de referência";
    contentViewer.appendChild(img);
}
