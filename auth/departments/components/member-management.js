export class MemberManagement {
  constructor(container) {
    this.container = container;
    this.members = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.container.addEventListener('click', e => {
      if (e.target.closest('.invite-member-btn')) {
        this.showInviteModal();
      } else if (e.target.closest('.remove-member-btn')) {
        const memberId = e.target.closest('.member-item').dataset.memberId;
        this.confirmRemoveMember(memberId);
      }
    });
  }

  render(members) {
    this.members = members;
    this.container.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Department Members</h3>
                    <button class="invite-member-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                        <i class="fas fa-user-plus mr-1"></i>Invite Member
                    </button>
                </div>
                <div class="space-y-2">
                    ${this.renderMembers(members)}
                </div>
            </div>
        `;
  }

  renderMembers(members) {
    return members
      .map(
        member => `
            <div class="member-item flex items-center justify-between p-3 bg-white rounded-lg shadow-sm" data-member-id="${member.id}">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-gray-500"></i>
                    </div>
                    <div>
                        <p class="font-medium">${member.name}</p>
                        <p class="text-sm text-gray-500">${member.email}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="px-2 py-1 text-xs rounded-full ${
                      member.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }">
                        ${member.role}
                    </span>
                    <button class="remove-member-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join('');
  }

  showInviteModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Invite Member</h3>
                <form id="inviteMemberForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email Address</label>
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
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#inviteMemberForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      await departmentManager.inviteMember(formData.get('email'), formData.get('role'));
      modal.remove();
    });
  }

  confirmRemoveMember(memberId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Remove Member</h3>
                <p class="text-gray-600 mb-6">Are you sure you want to remove this member from the department?</p>
                <div class="flex justify-end gap-2">
                    <button type="button" onclick="this.closest('.fixed').remove()"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="button" id="confirmRemoveBtn"
                            class="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                        Remove Member
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmRemoveBtn').addEventListener('click', async () => {
      await departmentManager.removeMember(memberId);
      modal.remove();
    });
  }
}
