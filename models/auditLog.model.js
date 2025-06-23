// models/auditLog.model.js
const mongoose = require("mongoose");
const AuditActions = require("../enums/auditActions.enum");
const AuditStatus = require("../enums/auditStatus.enum");
const AuditEntities = require("../enums/auditEntity.enum");

const getAllAuditActions = (actionsObj) => {
  return Object.values(actionsObj).flatMap((categoryObj) =>
    Object.values(categoryObj)
  );
};

const allAuditActions = getAllAuditActions(AuditActions);

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: allAuditActions, // You can use a flattened ALL object for global enums
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.SUCCESS,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(AuditEntities),
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the affected document

    // Optional metadata to describe the change
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    description: { type: String },

    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
