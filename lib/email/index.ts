// Export base email service
export { sendEmail } from './service';

// Export Package Request & Approval Templates
export {
  sendPackageRequestEmail,
  sendPackageApprovedEmail,
  sendPackageRejectedEmail,
} from './service';

// Export Status Change Templates
export {
  sendPackageStatusChangeEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail,
} from './service';

// Export Package Modification Templates
export {
  sendWeightModifiedEmail,
  sendFeesModifiedEmail,
  sendPackageInfoModifiedEmail,
} from './email-templates';

// Export Special Items Templates
export {
  sendSpecialItemAddedEmail,
  sendSpecialItemRemovedEmail,
} from './email-templates';

// Export Admin Communication Templates
export {
  sendAdminMessageEmail,
  sendImportantNotificationEmail,
} from './email-templates';

// Export Special Events Templates
export {
  sendDeliveryDelayedEmail,
  sendPackageIssueEmail,
} from './email-templates';

// Export Announcements & General Templates
export {
  sendAnnouncementEmail,
} from './email-templates';

// Export Account & Lifecycle Templates
export {
  sendWelcomeEmail,
  sendFeedbackRequestEmail,
  sendPackageReminderEmail,
} from './email-templates';

// Export User Workflow Templates
export {
  sendRequestSubmittedSuccessEmail,
  sendRequestUnderReviewEmail,
  sendFirstPackageEmail,
} from './workflow-templates';

// Export Detailed Status Templates
export {
  sendPackageReceivedDetailedEmail,
  sendPackageInTransitDetailedEmail,
  sendPackageArrivedHaitiEmail,
  sendCustomsClearedEmail,
} from './workflow-templates';

// Export Confirmation & Inspection Templates
export {
  sendInfoUpdatedConfirmationEmail,
  sendInspectionCompleteEmail,
} from './workflow-templates';
