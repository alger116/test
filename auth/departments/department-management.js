import { auth, db } from '../firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { DepartmentList } from './components/department-list.js';
import { DepartmentDetails } from './components/department-details.js';
import { MemberManagement } from './components/member-management.js';
import { TemplateAccess } from './components/template-access.js';

// Utility functions
const showErrorNotification = message => {
  const notification = document.createElement('div');
  notification.className =
    'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
};

const showSuccessNotification = message => {
  const notification = document.createElement('div');
  notification.className =
    'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
};

// Main department management logic
export class DepartmentManager {
  constructor() {
    this.currentDepartment = null;
    this.departments = [];
    this.members = new Map();
    this.templates = new Map();
    this.unsubscribeFunctions = [];
    this.userData = null;
  }

  async init() {
    try {
      // Only initialize if we're on a department page
      if (!window.location.pathname.includes('departments')) {
        return;
      }

      // Wait for auth state to be ready
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
          if (user) {
            // Load user data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              this.userData = userDoc.data();
              // Initialize if needed
              if (!this.userData.customPermissions) {
                await updateDoc(doc(db, 'users', user.uid), {
                  customPermissions: {
                    departmentManagement: {
                      create: this.userData.role === 'mainAdmin',
                      view: true,
                      edit: this.userData.role === 'mainAdmin',
                      delete: this.userData.role === 'mainAdmin',
                      manageMembers: this.userData.role === 'mainAdmin',
                      manageTemplates: this.userData.role === 'mainAdmin',
                    },
                  },
                });
                this.userData.customPermissions = {
                  departmentManagement: {
                    create: this.userData.role === 'mainAdmin',
                    view: true,
                    edit: this.userData.role === 'mainAdmin',
                    delete: this.userData.role === 'mainAdmin',
                    manageMembers: this.userData.role === 'mainAdmin',
                    manageTemplates: this.userData.role === 'mainAdmin',
                  },
                };
              }
            }
          }
          unsubscribe();
          resolve();
        });
      });

      // Load data
      await Promise.all([this.loadDepartments(), this.loadMembers(), this.loadTemplates()]);

      // Setup listeners
      this.setupEventListeners();
      this.setupRealTimeListeners();
    } catch (error) {
      console.error('Error in department manager:', error);
    }
  }

  hasPermission(permission) {
    if (!this.userData) return false;

    // Check custom permissions first
    if (this.userData.customPermissions?.departmentManagement?.[permission] !== undefined) {
      return this.userData.customPermissions.departmentManagement[permission];
    }

    // Fallback to role-based permissions
    if (this.userData.role === 'mainAdmin') return true;
    if (this.userData.role === 'admin') return true;
    if (this.userData.role === 'department_admin') return true;

    return false;
  }

  // Helper function to validate role changes
  async validateRoleChange(oldRole, newRole, currentUserRole) {
    // Prevent downgrading mainAdmin
    if (oldRole === 'mainAdmin') {
      showErrorNotification('Peaadministraatori rolli ei saa muuta!');
      return false;
    }

    // Allow mainAdmin to change any role except other mainAdmins
    if (currentUserRole === 'mainAdmin') {
      return true;
    }

    // Only mainAdmin can create or modify admin roles
    if (newRole === 'admin' || newRole === 'mainAdmin' || oldRole === 'admin') {
      showErrorNotification('Ainult peaadministraator võib luua või muuta administraatoreid!');
      return false;
    }

    return true;
  }

  // Helper function to log actions
  async logAction(action, details) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'auditLog'), {
        action,
        performedBy: user.uid,
        performedByEmail: user.email,
        timestamp: new Date(),
        details,
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  cleanup() {
    // Unsubscribe from all listeners
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }

  setupRealTimeListeners() {
    try {
      // Clean up any existing listeners first
      this.cleanup();

      // Only setup listeners if we're on a department page
      if (!window.location.pathname.includes('departments')) {
        return;
      }

      // Listen for department changes
      const deptUnsubscribe = onSnapshot(collection(db, 'departments'), snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            this.updateDepartment(change.doc.id, change.doc.data());
          } else if (change.type === 'removed') {
            this.removeDepartment(change.doc.id);
          }
        });
      });

      // Listen for membership changes
      const membershipUnsubscribe = onSnapshot(
        collection(db, 'departmentMemberships'),
        snapshot => {
          snapshot.docChanges().forEach(change => {
            const [userId, departmentId] = change.doc.id.split('_');
            if (change.type === 'added' || change.type === 'modified') {
              this.updateMember(userId, departmentId, change.doc.data());
            } else if (change.type === 'removed') {
              this.removeMember(userId, departmentId);
            }
          });
        }
      );

      // Store unsubscribe functions
      this.unsubscribeFunctions.push(deptUnsubscribe, membershipUnsubscribe);
    } catch (error) {
      console.error('Error in real-time listeners:', error);
    }
  }

  async loadDepartments() {
    try {
      const snapshot = await getDocs(collection(db, 'departments'));
      this.departments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.renderDepartmentList();
    } catch (error) {
      console.error('Error loading departments:', error);
      throw new Error('Failed to load departments. Please try again later.');
    }
  }

  async loadMembers() {
    try {
      const membersRef = collection(db, 'members');
      const querySnapshot = await getDocs(membersRef);
      querySnapshot.docs.forEach(doc => {
        this.members.set(doc.id, { id: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error('Error loading members:', error);
      throw new Error('Failed to load members. Please try again later.');
    }
  }

  async loadTemplates() {
    try {
      const templatesRef = collection(db, 'templates');
      const querySnapshot = await getDocs(templatesRef);
      querySnapshot.docs.forEach(doc => {
        this.templates.set(doc.id, { id: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      throw new Error('Failed to load templates. Please try again later.');
    }
  }

  async createDepartment(departmentData) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user has permission to create departments
      if (
        userData.role !== 'mainAdmin' &&
        !(
          userData.role === 'admin' && userData.customPermissions?.adminAccess?.departmentManagement
        )
      ) {
        throw new Error('Insufficient permissions to create department');
      }

      const newDept = {
        ...departmentData,
        createdAt: new Date(),
        createdBy: user.uid,
        members: [],
        templates: [],
      };

      const docRef = await addDoc(collection(db, 'departments'), newDept);

      // Create membership for the creator
      await setDoc(doc(db, 'departmentMemberships', `${user.uid}_${docRef.id}_admin`), {
        role: 'department_admin',
        joinedAt: new Date(),
      });

      // Log the action
      await this.logAction('create_department', {
        departmentId: docRef.id,
        departmentName: departmentData.name,
      });

      showSuccessNotification('Department created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating department:', error);
      showErrorNotification('Failed to create department');
      throw error;
    }
  }

  async updateDepartment(departmentId, updates) {
    try {
      const departmentRef = doc(db, 'departments', departmentId);
      await updateDoc(departmentRef, updates);

      // Update local state
      const index = this.departments.findIndex(d => d.id === departmentId);
      if (index !== -1) {
        this.departments[index] = { ...this.departments[index], ...updates };
        this.renderDepartmentList();
      }
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user has permission to delete departments
      if (
        userData.role !== 'mainAdmin' &&
        !(
          userData.role === 'admin' && userData.customPermissions?.adminAccess?.departmentManagement
        )
      ) {
        throw new Error('Insufficient permissions to delete department');
      }

      // Delete all related memberships first
      const membershipsQuery = query(
        collection(db, 'departmentMemberships'),
        where('departmentId', '==', departmentId)
      );
      const memberships = await getDocs(membershipsQuery);

      const batch = db.batch();
      memberships.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the department
      await deleteDoc(doc(db, 'departments', departmentId));

      // Log the action
      await this.logAction('delete_department', {
        departmentId,
      });

      showSuccessNotification('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      showErrorNotification('Failed to delete department');
      throw error;
    }
  }

  async addMember(departmentId, userId, role = 'member') {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user has permission to add members
      if (
        userData.role !== 'mainAdmin' &&
        !(
          userData.role === 'admin' && userData.customPermissions?.adminAccess?.departmentManagement
        )
      ) {
        throw new Error('Insufficient permissions to add member');
      }

      // Validate role change
      const targetUserDoc = await getDoc(doc(db, 'users', userId));
      const targetUserData = targetUserDoc.data();

      if (!(await this.validateRoleChange(targetUserData.role, role, userData.role))) {
        return;
      }

      await setDoc(doc(db, 'departmentMemberships', `${userId}_${departmentId}`), {
        role,
        joinedAt: new Date(),
      });

      // Log the action
      await this.logAction('add_member', {
        departmentId,
        userId,
        role,
      });

      showSuccessNotification('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      showErrorNotification('Failed to add member');
      throw error;
    }
  }

  async removeMember(departmentId, userId) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user has permission to remove members
      if (
        userData.role !== 'mainAdmin' &&
        !(
          userData.role === 'admin' && userData.customPermissions?.adminAccess?.departmentManagement
        )
      ) {
        throw new Error('Insufficient permissions to remove member');
      }

      await deleteDoc(doc(db, 'departmentMemberships', `${userId}_${departmentId}`));

      // Log the action
      await this.logAction('remove_member', {
        departmentId,
        userId,
      });

      showSuccessNotification('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      showErrorNotification('Failed to remove member');
      throw error;
    }
  }

  async addTemplate(departmentId, templateData) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user is mainAdmin or department admin
      const membership = await getDoc(
        doc(db, 'departmentMemberships', `${user.uid}_${departmentId}`)
      );

      if (
        userData.role !== 'mainAdmin' &&
        !(membership.exists && membership.data().role === 'department_admin')
      ) {
        throw new Error('Insufficient permissions to add templates');
      }

      const templateRef = await addDoc(
        collection(db, 'departments', departmentId, 'templates'),
        templateData
      );

      showSuccessNotification('Template added successfully');
      return templateRef.id;
    } catch (error) {
      console.error('Error adding template:', error);
      showErrorNotification('Failed to add template');
      throw error;
    }
  }

  async updateTemplate(departmentId, templateId, updates) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user is mainAdmin or department admin
      const membership = await getDoc(
        doc(db, 'departmentMemberships', `${user.uid}_${departmentId}`)
      );

      if (
        userData.role !== 'mainAdmin' &&
        !(membership.exists && membership.data().role === 'department_admin')
      ) {
        throw new Error('Insufficient permissions to update templates');
      }

      await updateDoc(doc(db, 'departments', departmentId, 'templates', templateId), updates);

      showSuccessNotification('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      showErrorNotification('Failed to update template');
      throw error;
    }
  }

  async deleteTemplate(departmentId, templateId) {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if user is mainAdmin or department admin
      const membership = await getDoc(
        doc(db, 'departmentMemberships', `${user.uid}_${departmentId}`)
      );

      if (
        userData.role !== 'mainAdmin' &&
        !(membership.exists && membership.data().role === 'department_admin')
      ) {
        throw new Error('Insufficient permissions to delete templates');
      }

      await deleteDoc(doc(db, 'departments', departmentId, 'templates', templateId));

      showSuccessNotification('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      showErrorNotification('Failed to delete template');
      throw error;
    }
  }

  setupEventListeners() {
    document.getElementById('createDepartmentBtn')?.addEventListener('click', () => {
      this.showCreateDepartmentModal();
    });
  }

  renderDepartmentList() {
    const container = document.getElementById('departmentList');
    if (!container) return;

    const departmentList = new DepartmentList(container, this.selectDepartment.bind(this));
    departmentList.render(this.departments);
  }

  selectDepartment(department) {
    this.currentDepartment = department;
    this.renderDepartmentDetails();
  }

  renderDepartmentDetails() {
    const container = document.getElementById('departmentDetails');
    if (!container) return;

    const details = new DepartmentDetails(container);
    details.render(this.currentDepartment);
  }

  // Add the missing updateMember method
  updateMember(userId, departmentId, memberData) {
    const member = this.members.get(userId);
    if (member) {
      member.departments = member.departments || {};
      member.departments[departmentId] = memberData;
      this.members.set(userId, member);
    }
  }
}

// Initialize
const departmentManager = new DepartmentManager();
