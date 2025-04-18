export class DepartmentList {
  constructor(container, onDepartmentSelect) {
    this.container = container;
    this.onDepartmentSelect = onDepartmentSelect;
    this.searchTerm = '';
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search departments...';
    searchInput.className =
      'w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
    searchInput.addEventListener('input', e => {
      this.searchTerm = e.target.value.toLowerCase();
      this.render(this.departments);
    });
    this.container.prepend(searchInput);
  }

  render(departments) {
    this.departments = departments;
    const filteredDepartments = this.searchTerm
      ? departments.filter(
          dept =>
            dept.name.toLowerCase().includes(this.searchTerm) ||
            dept.description?.toLowerCase().includes(this.searchTerm)
        )
      : departments;

    this.container.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Departments</h2>
                    <button id="createDepartmentBtn" 
                            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        <span>Create New</span>
                    </button>
                </div>
                <div class="space-y-2">
                    ${filteredDepartments.map(dept => this.renderDepartmentItem(dept)).join('')}
                </div>
            </div>
        `;

    // Add event listeners to department items
    filteredDepartments.forEach(dept => {
      const item = document.getElementById(`dept-${dept.id}`);
      if (item) {
        item.addEventListener('click', () => this.onDepartmentSelect(dept));
      }
    });
  }

  renderDepartmentItem(department) {
    const memberCount = department.members?.length || 0;
    const templateCount = department.templates?.length || 0;

    return `
            <div id="dept-${department.id}" 
                 class="department-item p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-medium text-lg">${department.name}</h3>
                        <p class="text-gray-600 text-sm mt-1">${department.description || 'No description'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-users"></i> ${memberCount}
                        </span>
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-file-alt"></i> ${templateCount}
                        </span>
                    </div>
                </div>
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <span>Created: ${new Date(department.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Admin: ${department.createdBy}</span>
                </div>
            </div>
        `;
  }

  showCreateDepartmentModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Create New Department</h3>
                <form id="createDepartmentForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows="3"
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#createDepartmentForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      const departmentData = {
        name: formData.get('name'),
        description: formData.get('description'),
      };
      await departmentManager.createDepartment(departmentData);
      modal.remove();
    });
  }
}
