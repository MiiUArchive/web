const OWNER = 'miiuarchive';
let currentRepo = 'mirrors'; // Dynamically changes depending on whether you are browsing 'mirrors' or 'releases'
let currentPath = '';

async function loadDirectory(path = '') {
    currentPath = path;
    const container = document.getElementById('file-list');
    container.innerHTML = '<p class="loading">Loading files...</p>';

    try {
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${currentRepo}/contents/${path}`);
        if (!response.ok) throw new Error('Failed to fetch directory contents.');
        
        const items = await response.json();
        container.innerHTML = '';

        // Back button if we are inside a subfolder
        if (currentPath !== '') {
            const parentPath = currentPath.split('/').slice(0, -1).join('/');
            container.appendChild(createItemElement('<FILE>', '.. (Back)', () => loadDirectory(parentPath)));
        }

        // Render directories first, then files
        items.sort((a, b) => (a.type === 'dir' ? -1 : 1)).forEach(item => {
            const icon = item.type === 'dir' ? '<DIR>' : '<FILE>';
            const action = item.type === 'dir' 
                ? () => loadDirectory(item.path) 
                : () => window.open(item.download_url, '_blank');

            container.appendChild(createItemElement(icon, item.name, action));
        });

    } catch (error) {
        container.innerHTML = `<p class="error">Error loading content: ${error.message}</p>`;
    }
}

function createItemElement(icon, name, onClick) {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `<span class="icon">${icon}</span> <span class="name">${name}</span>`;
    div.onclick = onClick;
    return div;
}

// Initialize on page load if the container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('file-list')) {
        loadDirectory();
    }
});
