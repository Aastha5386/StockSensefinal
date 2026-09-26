"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreated = exports.setUserRole = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
admin.initializeApp();
/**
 * Cloud Function to assign roles to users.
 * Only users with the 'admin' custom claim can execute this.
 */
exports.setUserRole = (0, https_1.onCall)(async (request) => {
    const { uid, role } = request.data;
    const callerAuth = request.auth;
    // 1. Check if caller is authenticated
    if (!callerAuth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to set user roles.');
    }
    // 2. Check if caller is an admin
    if (callerAuth.token.role !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Only administrators can assign roles.');
    }
    // 3. Validate role
    const validRoles = ['admin', 'inventory_manager', 'warehouse_staff'];
    if (!validRoles.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid role specified.');
    }
    try {
        // 4. Assign the custom claim
        await admin.auth().setCustomUserClaims(uid, { role });
        return { success: true, message: `Successfully assigned role ${role} to user ${uid}.` };
    }
    catch (error) {
        console.error('Error setting custom claims:', error);
        throw new https_1.HttpsError('internal', 'An error occurred while setting the role.');
    }
});
/**
 * Auth trigger to automatically assign 'warehouse_staff' to new users.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    try {
        await admin.auth().setCustomUserClaims(user.uid, { role: 'warehouse_staff' });
        console.log(`Assigned default role 'warehouse_staff' to new user: ${user.uid}`);
    }
    catch (error) {
        console.error('Error assigning default role:', error);
    }
});
//# sourceMappingURL=index.js.map