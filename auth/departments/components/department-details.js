export class DepartmentDetails {
  constructor(container) {
    this.container = container;
    this.department = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listeners for member management
    this.container.addEventListener('click', e => {
      if (e.target.closest('.add-member-btn')) {
        this.showAddMemberModal();
      } else if (e.target.closest('.remove-member-btn')) {
        const memberId = e.target.closest('.member-item').dataset.memberId;
        this.removeMember(memberId);
      }
    });
  }

  render(department) {
    this.department = department;
    if (!department) {
      this.container.classList.add('hidden');
      return;
    }

    this.container.classList.remove('hidden');
    this.container.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${department.name}</h2>
                        <p class="text-gray-600 mt-2">${department.description || 'No description provided'}</p>
                    </div>
                    <div class="flex space-x-4">
                        <button class="edit-department-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-edit mr-2"></i>Edit
                        </button>
                        <button class="delete-department-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Members Section -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Members</h3>
                            <button class="add-member-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                                <i class="fas fa-plus mr-1"></i>Add Member
                            </button>
                        </div>
                        <div class="space-y-2">
                            ${this.renderMembers(department.members || [])}
                        </div>
                    </div>

                    <!-- Templates Section -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Templates</h3>
                            <button class="add-template-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                                <i class="fas fa-plus mr-1"></i>Add Template
                            </button>
                        </div>
                        <div class="space-y-2">
                            ${this.renderTemplates(department.templates || [])}
                        </div>
                    </div>
                </div>

                <!-- Activity Log -->
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div class="space-y-4">
                        ${this.renderActivityLog(department.activity || [])}
                    </div>
                </div>
            </div>
        `;

    // Add event listeners for edit and delete buttons
    this.container
      .querySelector('.edit-department-btn')
      .addEventListener('click', () => this.showEditModal());
    this.container
      .querySelector('.delete-department-btn')
      .addEventListener('click', () => this.confirmDelete());
  }

  renderMembers(members) {
    return members
      .map(
        member => `
            <div class="member-item flex items-center justify-between p-2 bg-white rounded-lg" data-member-id="${member.id}">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-gray-500"></i>
                    </div>
                    <div>
                        <p class="font-medium">${member.name}</p>
                        <p class="text-sm text-gray-500">${member.role}</p>
                    </div>
                </div>
                <button class="remove-member-btn text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
      )
      .join('');
  }

  renderTemplates(templates) {
    return templates
      .map(
        template => `
            <div class="template-item flex items-center justify-between p-2 bg-white rounded-lg">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-file-alt text-blue-500"></i>
                    </div>
                    <div>
                        <p class="font-medium">${template.name}</p>
                        <p class="text-sm text-gray-500">Last modified: ${new Date(template.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-template-btn text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-template-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join('');
  }

  renderActivityLog(activities) {
    return activities
      .map(
        activity => `
            <div class="activity-item flex items-start p-3 bg-white rounded-lg">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i class="fas ${this.getActivityIcon(activity.type)} text-gray-500"></i>
                </div>
                <div>
                    <p class="font-medium">${activity.description}</p>
                    <p class="text-sm text-gray-500">${new Date(activity.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `
      )
      .join('');
  }

  getActivityIcon(type) {
    const icons = {
      member_added: 'fa-user-plus',
      member_removed: 'fa-user-minus',
      template_added: 'fa-file-plus',
      template_removed: 'fa-file-minus',
      department_updated: 'fa-edit',
      default: 'fa-info-circle',
    };
    return icons[type] || icons.default;
  }

  showAddMemberModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Add Member</h3>
                <form id="addMemberForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">User Email</label>
                        <input type="email" name="email" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="this.closest('.fixed').remove()"
                                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#addMemberForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      await departmentManager.addMember(
        this.department.id,
        formData.get('email'),
        formData.get('role')
      );
      modal.remove();
    });
  }

  showEditModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Edit Department</h3>
                <form id="editDepartmentForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value="${this.department.name}" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows="3"
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${this.department.description || ''}</textarea>
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

    const form = modal.querySelector('#editDepartmentForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      await departmentManager.updateDepartment(this.department.id, {
        name: formData.get('name'),
        description: formData.get('description'),
      });
      modal.remove();
    });
  }

  confirmDelete() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Confirm Delete</h3>
                <p class="text-gray-600 mb-6">Are you sure you want to delete this department? This action cannot be undone.</p>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="this.closest('.fixed').remove()"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="button" id="confirmDeleteBtn"
                            class="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                        Delete Department
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
      await departmentManager.deleteDepartment(this.department.id);
      modal.remove();
    });
  }

  async removeMember(memberId) {
    await departmentManager.removeMember(this.department.id, memberId);
  }
}
