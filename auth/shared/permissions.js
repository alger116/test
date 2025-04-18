const DepartmentPermissions = {
    async getUserDepartments(userId) {
        const memberships = await db.collection('departmentMemberships')
            .where('userId', '==', userId)
            .get();
            
        return Promise.all(
            memberships.docs.map(async doc => {
                const deptDoc = await db.collection('departments')
                    .doc(doc.data().departmentId)
                    .get();
                return {
                    ...deptDoc.data(),
                    id: deptDoc.id,
                    role: doc.data().role
                };
            })
        );
    },

    async canManageDepartment(userId, departmentId) {
        const membership = await db.collection('departmentMemberships')
            .where('userId', '==', userId)
            .where('departmentId', '==', departmentId)
            .where('role', '==', 'department_admin')
            .get();
            
        return !membership.empty;
    }

    // ... more permission-related utilities
};