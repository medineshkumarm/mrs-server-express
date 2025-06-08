// constants/auditActions.enum.js

const AuditActions = {
  USER: {
    CREATE: "USER_CREATE",
    UPDATE: "USER_UPDATE",
    DELETE: "USER_DELETE",
    ROLE_CHANGE: "USER_ROLE_CHANGE",
  },
  COURT: {
    CREATE: "COURT_CREATE",
    UPDATE: "COURT_UPDATE",
    DELETE: "COURT_DELETE",
  },
  SLOT: {
    CREATE: "SLOT_CREATE",
    UPDATE: "SLOT_UPDATE",
    DELETE: "SLOT_DELETE",
    BOOK: "SLOT_BOOK",
    CANCEL_BOOKING: "SLOT_CANCEL_BOOKING",
    LOCK: "SLOT_LOCK",
    UNLOCK: "SLOT_UNLOCK",
  },
  PAYMENT: {
    INITIATE: "PAYMENT_INITIATE",
    VERIFY: "PAYMENT_VERIFY",
    FAIL: "PAYMENT_FAIL",
    REFUND: "PAYMENT_REFUND",
  },
};

Object.freeze(AuditActions); 
module.exports = AuditActions;
