const AuditLog = require("../../models/auditLog.model");

class AuditLogService {
  /**
   * Creates an audit log entry.
   * @param {Object} params
   * @param {string} params.action - The action name like "UPDATE_USER"
   * @param {string} params.performedBy - User ID who performed the action
   * @param {string} params.entityType - e.g. "User", "Slot"
   * @param {string} params.entityId - Affected entity ID
   * @param {Object} [params.oldValue] - Old data before change
   * @param {Object} [params.newValue] - New data after change
   * @param {string} [params.description] - Optional description
   * @param {string} [params.ipAddress] - IP address of request
   * @param {string} [params.userAgent] - User agent string
   */
  static async createLog(params) {
    const log = new AuditLog(params);
    await log.save();
  }
}

module.exports = AuditLogService;
