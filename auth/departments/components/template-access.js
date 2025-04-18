export class TemplateAccess {
  constructor(container) {
    this.container = container;
    this.templates = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.container.addEventListener('click', e => {
      if (e.target.closest('.add-template-btn')) {
        this.showAddTemplateModal();
      } else if (e.target.closest('.edit-template-btn')) {
        const templateId = e.target.closest('.template-item').dataset.templateId;
        this.showEditTemplateModal(templateId);
      } else if (e.target.closest('.delete-template-btn')) {
        const templateId = e.target.closest('.template-item').dataset.templateId;
        this.confirmDeleteTemplate(templateId);
      }
    });
  }

  render(templates) {
    this.templates = templates;
    this.container.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Department Templates</h3>
                    <button class="add-template-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                        <i class="fas fa-plus mr-1"></i>Add Template
                    </button>
                </div>
                <div class="space-y-2">
                    ${this.renderTemplates(templates)}
                </div>
            </div>
        `;
  }

  renderTemplates(templates) {
    return templates
      .map(
        template => `
            <div class="template-item flex items-center justify-between p-3 bg-white rounded-lg shadow-sm" data-template-id="${template.id}">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-file-alt text-blue-500"></i>
                    </div>
                    <div>
                        <p class="font-medium">${template.name}</p>
                        <p class="text-sm text-gray-500">Last modified: ${new Date(template.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="px-2 py-1 text-xs rounded-full ${
                      template.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }">
                        ${template.status}
                    </span>
                    <div class="flex space-x-2">
                        <button class="edit-template-btn text-blue-500 hover:text-blue-700">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-template-btn text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  showAddTemplateModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Add Template</h3>
                <form id="addTemplateForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Template Name</label>
                        <input type="text" name="name" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows="3"
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Add Template
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#addTemplateForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      await departmentManager.addTemplate({
        name: formData.get('name'),
        description: formData.get('description'),
        status: formData.get('status'),
      });
      modal.remove();
    });
  }

  showEditTemplateModal(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Edit Template</h3>
                <form id="editTemplateForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Template Name</label>
                        <input type="text" name="name" value="${template.name}" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows="3"
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${template.description || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="active" ${template.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="draft" ${template.status === 'draft' ? 'selected' : ''}>Draft</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#editTemplateForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      await departmentManager.updateTemplate(templateId, {
        name: formData.get('name'),
        description: formData.get('description'),
        status: formData.get('status'),
      });
      modal.remove();
    });
  }

  confirmDeleteTemplate(templateId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Delete Template</h3>
                <p class="text-gray-600 mb-6">Are you sure you want to delete this template? This action cannot be undone.</p>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="this.closest('.fixed').remove()"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="button" id="confirmDeleteBtn"
                            class="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                        Delete Template
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
      await departmentManager.deleteTemplate(templateId);
      modal.remove();
    });
  }
}
