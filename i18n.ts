// All translations are embedded directly to solve module resolution issues.

const en = {
  "app": {
    "title": {
      "full": "Business Hub Pro",
      "short": "Business Hub"
    }
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "customers": "Customers",
    "suppliers": "Suppliers",
    "agenda": "Agenda",
    "reports": "Reports",
    "whatsapp": "WhatsApp Sender",
    "settings": "Settings",
    "help": "Help"
  },
  "header": {
    "searchPlaceholder": "Search...",
    "changeToDarkMode": "Switch to dark mode",
    "changeToLightMode": "Switch to light mode",
    "appointmentsForToday": "Appointments for Today",
    "noAppointmentsToday": "No upcoming appointments for today.",
    "logout": "Logout",
    "searchResults": {
      "customers": "Customers",
      "suppliers": "Suppliers",
      "appointments": "Appointments",
      "noResults": "No results found."
    },
    "trialBanner": "You have {{days}} days left in your trial period.",
    "pastDueBanner": "Your account is past due. Please update your payment information.",
    "trialExpiredBanner": "Your trial period has expired."
  },
  "login": {
    "welcome": "Welcome back! Access your account.",
    "emailLabel": "Email",
    "emailPlaceholder": "your@email.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "••••••",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot your password?",
    "firstTimeOrForgot": "First time? / Forgot password?",
    "signIn": "Sign In",
    "signingIn": "Signing In...",
    "continueWith": "Or continue with",
    "errors": {
      "invalidCredentials": "Invalid email or password.",
      "pendingAccount": "Your account is pending setup. Please use the 'Forgot Password' link to set your password."
    }
  },
  "resetPassword": {
    "title": "Set/Reset Password",
    "instructions": "Enter your email address. We'll send you a link to reset your password.",
    "continue": "Continue",
    "sendLink": "Send Reset Link",
    "emailNotFound": "No account found with that email address.",
    "setNewPasswordTitle": "Set a New Password",
    "password": "New Password",
    "confirmPassword": "Confirm New Password",
    "passwordMismatch": "Passwords do not match.",
    "passwordTooShort": "Password must be at least 6 characters long.",
    "savePassword": "Save Password",
    "success": "Password successfully updated! You can now log in.",
    "successLinkSent": "If an account exists for this email, a password reset link has been sent.",
    "backToLogin": "Back to Login"
  },
  "dashboard": {
    "title": "Dashboard",
    "cards": {
      "activeCustomers": "Active Customers",
      "totalSuppliers": "Total Suppliers",
      "upcomingAppointments": "Upcoming Appointments"
    },
    "charts": {
      "customerInteractionsTitle": "Customer Interactions (Last 6 months)",
      "interactions": "Interactions"
    },
    "upcomingAppointments": {
      "title": "Next 5 Appointments",
      "none": "No upcoming appointments."
    },
    "recentActivity": {
      "title": "Recent Activity",
      "summary": "A summary of recent activity will be displayed here."
    },
    "calendar": {
      "viewAppointmentsFor": "View appointments for {{date}}",
      "selectYear": "Select year"
    }
  },
  "customers": {
    "title": "Customers",
    "searchPlaceholder": "Search by customer name...",
    "add": "Add Customer",
    "edit": "Edit Customer",
    "addNew": "Add New Customer",
    "name": "Name",
    "contact": "Contact",
    "status": "Status",
    "customerSince": "Customer Since",
    "actions": "Actions",
    "filters": {
      "all": "All Statuses",
      "status": "Status",
      "sort_by": "Sort by",
      "sort_options": {
        "date_newest": "Date (Newest)",
        "date_oldest": "Date (Oldest)",
        "name_asc": "Name (A-Z)",
        "name_desc": "Name (Z-A)",
        "status": "Status"
      }
    },
    "noCustomersFound": "No customers found.",
    "statusActive": "Active",
    "statusInactive": "Inactive",
    "typePerson": "Individual",
    "typeCompany": "Company",
    "details": "Details of {{name}}",
    "fetchError": "Failed to fetch customers.",
    "confirmDelete": {
      "title": "Confirm Deletion",
      "header": "Delete Customer",
      "body": "Are you sure you want to delete <strong>{{name}}</strong>? This action is permanent and cannot be undone."
    },
    "deleteBlocked": {
      "title": "Deletion Blocked",
      "body": "This customer cannot be deleted. They are associated with {{count}} appointment(s). Please remove them from the appointments before deleting."
    },
    "analysis": {
      "title": "Interaction Analysis for {{name}}",
      "button": "Analyze with AI"
    },
    "form": {
      "fullName": "Full Name",
      "companyName": "Company Name",
      "email": "Email",
      "type": "Type",
      "cnpj": "Tax ID",
      "cpf": "Tax ID",
      "phone": "Phone",
      "cep": "Postal Code",
      "address": "Address",
      "status": "Status",
      "province": "Province",
      "companyLogo": "Company Logo",
      "uploadLogo": "Upload Logo",
      "logoHint": "If no logo is uploaded, the company's initials will be used.",
      "avatar": "Avatar",
      "changeAvatar": "Change Avatar",
      "errors": {
        "invalidCpf": "Invalid Tax ID. Please check the number.",
        "invalidCnpj": "Invalid Tax ID. Please check the number.",
        "invalidDni": "Invalid DNI. Please check the number.",
        "invalidCuit": "Invalid CUIT. Please check the number.",
        "cepNotFound": "Postal code not found.",
        "cepError": "Error fetching address for the postal code.",
        "invalidCpa": "Invalid CPA (Argentine Postal Code)."
      }
    },
    "detailsView": {
      "tabs": {
        "details": "Details",
        "interactions": "Interactions",
        "documents": "Documents"
      },
      "addInteraction": {
        "title": "Log New Interaction",
        "placeholder": "Describe the interaction here...",
        "typeLabel": "Type:",
        "types": {
          "call": "Call",
          "email": "Email",
          "meeting": "Meeting",
          "note": "Note"
        }
      },
      "noInteractions": "No interactions logged.",
      "documents": {
        "title": "Customer Documents",
        "upload": "Upload Document",
        "noDocuments": "No documents uploaded.",
        "confirmDelete": {
          "title": "Confirm Document Deletion",
          "body": "Are you sure you want to delete the document <strong>{{name}}</strong>?"
        }
      }
    }
  },
  "suppliers": {
    "title": "Suppliers",
    "searchPlaceholder": "Search by company name or contact...",
    "add": "Add Supplier",
    "edit": "Edit Supplier",
    "addNew": "Add New Supplier",
    "companyName": "Company Name",
    "contact": "Contact",
    "services": "Services",
    "actions": "Actions",
    "noSuppliersFound": "No suppliers found.",
    "viewDetails": "View Details",
    "detailsOf": "Details of {{name}}",
    "confirmDelete": {
      "title": "Confirm Deletion",
      "header": "Delete Supplier",
      "body": "Are you sure you want to delete <strong>{{name}}</strong>? This action is permanent and cannot be undone."
    },
    "deleteBlocked": {
      "title": "Deletion Blocked",
      "body": "This supplier cannot be deleted. They are associated with {{count}} appointment(s). Please remove the association before deleting."
    },
    "form": {
      "companyData": "Company Data",
      "companyLogo": "Company Logo",
      "uploadLogo": "Upload Logo",
      "logoHint": "If no logo is uploaded, the initials will be used.",
      "companyName": "Company Name",
      "cnpj": "Tax ID",
      "cuit": "CUIT",
      "cep": "Postal Code",
      "address": "Address",
      "province": "Province",
      "contactInfo": "Contact Information",
      "contactPerson": "Contact Person",
      "contactAvatar": "Contact's Avatar",
      "changeAvatar": "Change Avatar",
      "fullName": "Full Name",
      "email": "Email",
      "phone": "Phone",
      "services": "Services (comma separated)",
      "errors": {
        "invalidCnpj": "Invalid Tax ID. Please check the number.",
        "invalidCuit": "Invalid CUIT. Please check the number.",
        "cnpjNotFound": "Tax ID not found.",
        "cnpjError": "Error fetching Tax ID data.",
        "cepNotFound": "Postal code not found.",
        "cepError": "Error fetching address for the postal code.",
        "invalidCpa": "Invalid CPA (Argentine Postal Code)."
      }
    }
  },
  "agenda": {
    "title": "Agenda",
    "add": "New Appointment",
    "edit": "Edit Appointment",
    "viewCompleted": "View Completed",
    "allAppointments": "All Appointments",
    "more": "more",
    "noAppointmentsInCategory": "No appointments in this category.",
    "views": {
      "board": "Board",
      "list": "List",
      "month": "Month",
      "week": "Week",
      "day": "Day"
    },
    "searchPlaceholder": "Search by title...",
    "filter": {
      "allCustomers": "All Customers",
      "allSuppliers": "All Suppliers"
    },
    "board": {
      "overdue": "To Do (Overdue)",
      "today": "Today",
      "tomorrow": "Tomorrow",
      "next7Days": "Next 7 Days",
      "future": "Future",
      "completed": "Completed",
      "viewAll": "View All ({{count}})"
    },
    "noScheduledAppointments": "No scheduled appointments found for the selected filters.",
    "details": {
      "title": "Details",
      "history": "History",
      "noDescription": "No description provided.",
      "dateTime": "Date & Time:",
      "location": "Location:",
      "notSpecified": "Not specified",
      "dueDate": "Due Date:",
      "participants": "Participants:",
      "attachments": "Attachments:",
      "reopen": "Reopen",
      "aiSummary": "AI Summary",
      "edit": "Edit",
      "modifiedBy": "Modified by",
      "previousData": "Previous data",
      "subtasks": "Subtasks",
      "subtaskProgress": "Subtask Progress",
      "deleteSubtask": "Delete subtask",
      "confirmDeleteSubtask": {
        "title": "Delete Subtask",
        "body": "Are you sure you want to delete the subtask '<strong>{{name}}</strong>'? This action cannot be undone."
      },
      "addSubtaskPlaceholder": "Add new subtask..."
    },
    "form": {
      "generalInfo": "General Information",
      "title": "Title",
      "description": "Description",
      "dateAndTime": "Date & Time",
      "start": "Start",
      "end": "End",
      "dueDate": "Due Date (Optional)",
      "repeat": "Repeat appointment",
      "frequency": "Frequency",
      "repeatUntil": "Repeat until",
      "frequencies": {
        "daily": "Daily",
        "weekly": "Weekly",
        "monthly": "Monthly",
        "yearly": "Yearly"
      },
      "detailsAndAssociations": "Details & Associations",
      "location": "Location",
      "category": "Category",
      "reminder": "Reminder",
      "reminders": {
        "none": "None",
        "5": "5 minutes before",
        "15": "15 minutes before",
        "30": "30 minutes before",
        "60": "1 hour before",
        "1440": "1 day before"
      },
      "relatedCustomer": "Related Customer",
      "noCustomer": "None",
      "relatedSupplier": "Related Supplier",
      "noSupplier": "None",
      "participantsAndAttachments": "Participants & Attachments",
      "teamParticipants": "Team Participants",
      "searchTeam": "Search team...",
      "attachments": "Attachments",
      "addFiles": "Add Files",
      "notify": "Notify participants by email",
      "noParticipants": "No participants added.",
      "addParticipant": "Add Participant",
      "noUsersFound": "No users found.",
      "errors": {
        "general": "Please fill in the title, start date, and end date.",
        "invalidDate": "The start or end date/time is invalid.",
        "endBeforeStart": "End date must be after the start date.",
        "dueAfterStart": "Due date must be after the start date.",
        "recurrenceEnd": "Please set an end date for the recurrence."
      }
    },
    "completed": {
      "title": "Completed Appointments History",
      "searchPlaceholder": "Search by title...",
      "completedOn": "Completed on: {{date}}",
      "noCompleted": "No completed appointments found."
    },
    "summary": {
      "title": "Summary of {{title}}",
      "error": "Failed to generate summary. An error occurred with the AI service."
    }
  },
  "reports": {
    "title": "Reports & Exports",
    "exportPDF": "Export PDF",
    "exportExcel": "Export Excel",
    "startDate": "Start Date",
    "endDate": "End Date",
    "tabs": {
      "appointments": "Appointments",
      "customers": "Customers",
      "suppliers": "Suppliers",
      "activity": "Activity Log"
    },
    "appointments": {
      "title": "Appointments Report",
      "fileName": "Appointments_Report",
      "table": {
        "title": "Title",
        "dateTime": "Date & Time",
        "dueDate": "Due Date",
        "location": "Location",
        "participants": "Participants"
      }
    },
    "customers": {
      "title": "Customers Report",
      "fileName": "Customers_Report",
      "statusChartTitle": "Customer Status",
      "listTitle": "Customer List",
      "table": {
        "name": "Name",
        "status": "Status",
        "email": "Email",
        "phone": "Phone",
        "type": "Type"
      }
    },
    "suppliers": {
      "title": "Suppliers by Category Report",
      "fileName": "Suppliers_Report",
      "table": {
        "category": "Category",
        "supplier": "Supplier",
        "contact": "Contact",
        "email": "Email",
        "cnpj": "Tax ID"
      }
    },
    "activity": {
      "title": "Activity Log",
      "fileName": "Activity_Log",
      "type": "Activity Type",
      "allTypes": "All Types",
      "table": {
        "date": "Date",
        "type": "Type",
        "description": "Description"
      }
    }
  },
  "settings": {
    "title": "Settings",
    "tabs": {
      "myCompany": "My Company",
      "users": "Users",
      "categories": "Categories",
      "companies": "Companies",
      "plans": "Plans",
      "permissions": "Permissions",
      "systemCustomization": "Customization",
      "integrations": "Integrations"
    },
    "integrations": {
      "title": "Integrations",
      "description": "Configure integrations with third-party services here.",
      "whatsApp": {
        "phoneId": "WhatsApp Phone Number ID",
        "token": "WhatsApp Access Token"
      },
      "savedSuccess": "Integration settings saved successfully!"
    },
    "customization": {
      "title": "System Customization",
      "logoTitle": "System Logo (Login Screen)",
      "logoDescription": "This logo will appear on the login screen for all users.",
      "changeLogo": "Change Logo",
      "removeLogo": "Remove Logo",
      "noLogo": "No logo set"
    },
    "company": {
      "title": "Company Information",
      "editTitle": "Edit Company Information",
      "editButton": "Edit",
      "logo": "Company Logo",
      "name": "Company Name",
      "cnpj": "Tax ID",
      "address": "Address",
      "contactEmail": "Contact Email",
      "phone": "Phone",
      "changeLogo": "Change Logo",
      "errors": {
        "invalidFormat": "Invalid file format. Use JPG, PNG, or SVG.",
        "fileTooLarge": "File is too large. Limit is {{limit}}MB.",
        "uploadFailed": "An error occurred while reading the file."
      }
    },
    "users": {
      "title": "User Management",
      "add": "Add User",
      "edit": "Edit User",
      "addNew": "Add New User",
      "sendPasswordReset": "Send password reset",
      "table": {
        "name": "Name",
        "role": "Role",
        "company": "Company",
        "actions": "Actions"
      },
      "form": {
        "fullName": "Full Name",
        "email": "Email",
        "role": "Role",
        "company": "Company",
        "selectCompany": "Select a company",
        "avatar": "Change Avatar",
        "roles": {
          "admin": "Administrator",
          "manager": "Manager",
          "collaborator": "Collaborator"
        },
        "errors": {
          "selectCompany": "Please select a company for the new user."
        }
      }
    },
    "companies": {
      "title": "Company Management",
      "searchPlaceholder": "Search by name or Tax ID...",
      "add": "Add Company",
      "edit": "Edit Company",
      "detailsTab": "Details",
      "historyTab": "History",
      "reasonForChange": "Reason for Change (Required)",
      "noHistory": "No status changes have been logged for this company.",
      "historyTable": {
        "date": "Date",
        "changedBy": "Changed By",
        "newStatus": "Change",
        "reason": "Reason"
      },
      "history": {
        "changedStatus": "changed status from <strong>{{old}}</strong> to <strong>{{new}}</strong>."
      },
      "table": {
        "name": "Company Name",
        "cnpj": "Tax ID",
        "actions": "Actions",
        "status": "Status",
        "trialEnds": "Trial Ends"
      },
      "enableTrial": "Enable trial period?",
      "trialDuration": "Trial Duration (days)",
      "adminInfo": "Administrator Information",
      "deleteWarning": "The main company 'Business Hub Pro Inc.' cannot be removed for safety.",
      "confirmDeleteTitle": "Confirm Company Deletion",
      "confirmDelete": "Are you sure you want to delete the company \"{{name}}\"? All associated data (users, customers, etc.) will be permanently removed."
    },
    "plans": {
      "title": "Plan Management",
      "add": "Add Plan",
      "edit": "Edit Plan",
      "addNew": "Add New Plan",
      "currentPlan": "Current Plan",
      "perMonth": "/month",
      "userLimit": "{{count}} Users",
      "customerLimit": "{{count}} Customers",
      "noPlansTitle": "No plans created yet",
      "noPlansDescription": "Get started by creating your first subscription plan.",
      "createFirstPlan": "Create First Plan",
      "form": {
        "name": "Plan Name",
        "price": "Price (monthly)",
        "userLimit": "User Limit",
        "customerLimit": "Customer Limit",
        "hasWhatsApp": "Enable WhatsApp Module",
        "hasAI": "Enable AI Features",
        "allowBranding": "Allow Brand Customization"
      },
      "features": {
        "whatsApp": "WhatsApp Module",
        "ai": "AI Features",
        "branding": "Brand Customization (Logo)"
      },
      "confirmDeleteTitle": "Confirm Plan Deletion",
      "confirmDeleteBody": "Are you sure you want to delete the plan '{{name}}'?",
      "deleteBlockedTitle": "Deletion Blocked",
      "deleteBlockedBody": "This plan cannot be deleted as it is assigned to the following companies: {{companies}}."
    },
    "categories": {
      "title": "Appointment Categories",
      "save": "Save Changes",
      "new": "New Category",
      "deleteWarning": "There must be at least one category.",
      "confirmDelete": "Are you sure you want to remove the category \"{{name}}\"?.",
      "errors": {
        "emptyName": "Category name cannot be empty.",
        "duplicateName": "Category name \"{{name}}\" is duplicated."
      },
      "tooltips": {
        "cannotEditName": "Default category names cannot be changed as they are used for system translations.",
        "cannotDelete": "Default categories cannot be deleted."
      }
    },
    "permissions": {
      "title": "Detailed User Permissions",
      "selectUser": "Select a User",
      "editingFor": "Editing permissions for: {{name}}",
      "selectUserPrompt": "Select a user to view and edit their permissions.",
      "save": "Save Permissions",
      "groups": {
        "dashboard": "Dashboard",
        "customers": "Customers",
        "suppliers": "Suppliers",
        "agenda": "Agenda",
        "reports": "Reports",
        "settings": "Settings",
        "superAdmin": "General Administration"
      },
      "descriptions": {
        "VIEW_DASHBOARD": "View dashboard",
        "VIEW_CUSTOMERS": "View customers",
        "MANAGE_CUSTOMERS": "Add/Edit customers",
        "DELETE_CUSTOMERS": "Delete customers",
        "VIEW_SUPPLIERS": "View suppliers",
        "MANAGE_SUPPLIERS": "Add/Edit suppliers",
        "DELETE_SUPPLIERS": "Delete suppliers",
        "VIEW_AGENDA": "View agenda",
        "MANAGE_AGENDA": "Manage agenda (create/edit events)",
        "VIEW_REPORTS": "View reports",
        "VIEW_SETTINGS": "Access settings",
        "MANAGE_COMPANY_INFO": "Edit own company info",
        "MANAGE_USERS": "Manage users in own company",
        "MANAGE_CATEGORIES": "Manage appointment categories",
        "MANAGE_ALL_USERS": "Manage users in ANY company",
        "MANAGE_PLANS": "Manage subscription plans"
      }
    }
  },
  "help": {
    "title": "Help Center",
    "intro": "Welcome! Here you'll find guides on how to use the features of Business Hub.",
    "downloadManual": "Download PDF Manual",
    "manualFilename": "Manual_BusinessHubPro.pdf",
    "sections": {
      "dashboard": {
        "title": "Main Dashboard",
        "content": "<p>The Dashboard is your home screen, designed to provide a quick overview of your business's most important information.</p><h4>Key Components:</h4><ul><li><strong>Stat Cards:</strong> At the top, you'll see key numbers like total active customers, suppliers, and your upcoming appointments. These cards serve as a daily pulse check on your operation.</li><li><strong>New Customers Chart:</strong> This chart shows the growth of your customer base over the past few months, allowing you to identify acquisition trends.</li><li><strong>Upcoming Appointments List:</strong> A quick summary of your next scheduled events for the day, ensuring you never miss an important meeting.</li></ul>"
      },
      "customers": {
        "title": "Managing Customers",
        "content": "<h4>Viewing the Customer List</h4><p>On this screen, you'll see a table with all your customers. Use the search bar at the top to find a specific customer by name.</p><h4>Adding a New Customer</h4><ol><li>Click the blue <strong>\\\"+ Add Customer\\\"</strong> button in the top right corner.</li><li>Fill out the form. The system automatically validates the DNI/CUIT to ensure data integrity.</li><li>For individual customers, you can choose a predefined avatar or upload a photo.</li><li>After filling it out, click \\\"Add Customer\\\" to save.</li></ol><h4>Viewing Details and Interactions</h4><ul><li>Click on any customer in the list to open a window with their complete details.</li><li>Navigate to the \\\"Interactions\\\" tab to see the entire history of contacts, such as calls, emails, and meetings.</li><li>You can log a new interaction directly on this tab.</li></ul><h4>AI Analysis</h4><p>On the interactions tab, if there's a history of contacts, you can use the <strong>\\\"Analyze with AI\\\"</strong> button. The artificial intelligence will read the interactions and generate a strategic summary, identifying customer sentiment, business opportunities, and suggesting next steps.</p>"
      },
      "suppliers": {
        "title": "Managing Suppliers",
        "content": "<p>Supplier management is centralized on this screen, working very similarly to customer management. You can register partners, contact information, and the services they provide.</p><ul><li>Use the <strong>\\\"+ Add Supplier\\\"</strong> button to register a new partner.</li><li>Fill in the company data as well as the information for the main contact person.</li><li>You can view, edit, or remove a supplier using the icons in the list.</li></ul>"
      },
      "agenda": {
        "title": "Using the Agenda",
        "content": "<h4>Agenda Views</h4><p>The agenda offers multiple ways to view your appointments. Use the buttons in the top right corner to switch between views:</p><ul><li><strong>Board (Kanban):</strong> Ideal for weekly planning. Organize appointments into columns like \\\"Today\\\", \\\"Tomorrow\\\", and \\\"Next 7 Days\\\". Drag and drop cards to reschedule appointments intuitively.</li><li><strong>List:</strong> A chronological view of all your future appointments.</li><li><strong>Month, Week, Day:</strong> Classic calendar views for short and long-term planning.</li></ul><h4>Creating and Managing Appointments</h4><ol><li>Click the <strong>\\\"+ New Appointment\\\"</strong> button.</li><li>Fill in details like title, description, start and end date/time.</li><li>Associate appointments with customers or suppliers to maintain an integrated history.</li><li>Attach important files and set up recurrences for regular events (daily, weekly, etc.).</li><li>Mark an appointment as completed directly on the board or in the list.</li><li><strong>Add subtasks</strong> to detail activities. Mark them as complete and track progress with visual indicators on the board and a progress bar in the detail view.</li></ol><h4>History and AI Summary</h4><p>Access the \\\"History\\\" to see all completed appointments. For any appointment in the history, click <strong>\\\"AI Summary\\\"</strong>. The system will generate a professional summary of the meeting, ideal for minutes and follow-ups.</p>"
      },
      "reports": {
        "title": "Reports and Exports",
        "content": "<p>This section allows you to view consolidated data and export it for use in other tools or for presentations.</p><ul><li><strong>Navigate Tabs:</strong> Choose between reports for Appointments, Customers, Suppliers, or Activity Log.</li><li><strong>Filter Data:</strong> In each report, you can use filters, such as date ranges, to focus on the data that matters most.</li><li><strong>Export to PDF or Excel:</strong> For each report, you will find buttons to \\\"Export PDF\\\" (great for printing and sharing) and \\\"Export Excel\\\" (ideal if you need to manipulate the data in spreadsheets).</li></ul>"
      },
      "settings": {
        "title": "Settings",
        "content": "<p>Customize the system to meet the needs of your team and company.</p><ul><li><strong>My Company:</strong> Update your company's registration details, such as address, phone, and Tax ID.</li><li><strong>Users:</strong> Add new team members to the system, edit their information, and set their permissions (Administrator, Manager, Collaborator).</li><li><strong>Categories:</strong> Customize appointment categories. You can rename, change icons and colors to better suit your organization.</li><li><strong>Companies (Super Admin):</strong> If you are a super administrator, you will see an additional tab to manage all companies registered in the system.</li></ul>"
      },
      "faq": {
        "title": "Frequently Asked Questions (FAQ)",
        "q1": "What do I do if I forget my password?",
        "a1": "Currently, password recovery is not yet automated. Please contact the system administrator in your company to request a new temporary password.",
        "q2": "Can I use the system on my phone or tablet?",
        "a2": "Yes! \\\"Business Hub Pro\\\" was designed to be responsive, meaning it adapts to different screen sizes. The experience may be slightly different, but all main features will be available.",
        "q3": "How does the top search bar work?",
        "a3": "The search bar at the top of the screen is a powerful tool. Start typing the name of a customer, supplier, or the title of an appointment, and the results will appear automatically. Clicking a result will take you directly to the corresponding page.",
        "q4": "What does the notification bell show?",
        "a4": "The bell icon shows a number representing how many appointments you have scheduled for the rest of today. Clicking it opens a quick list of these appointments."
      }
    }
  },
  "common": {
    "save": "Save",
    "saving": "Saving...",
    "cancel": "Cancel",
    "saveChanges": "Save Changes",
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "close": "Close",
    "ok": "OK",
    "actions": "Actions",
    "today": "Today",
    "unknownUser": "Unknown User",
    "uploadedOn": "Uploaded on {{date}}",
    "confirmDiscard": "You have unsaved changes. Are you sure you want to discard them?",
    "time": {
        "minute": "{{count}} minute",
        "minutes": "{{count}} minutes",
        "hour": "{{count}} hour",
        "hours": "{{count}} hours",
        "day": "{{count}} day",
        "days": "{{count}} days"
    }
  },
  "notifications": {
    "companyUpdated": "Company information updated successfully!",
    "userUpdated": "User updated successfully!",
    "userAdded": "User added successfully!",
    "userAddedWithReset": "User added! They must use the 'Forgot Password' link to set their password.",
    "companyAdded": "Company added successfully!",
    "companyRemoved": "Company removed successfully!",
    "categoriesSaved": "Categories saved successfully!",
    "permissionsSaved": "Permissions saved successfully!",
    "integrationsSaved": "Integration settings saved successfully!",
    "planAdded": "Plan added successfully!",
    "planUpdated": "Plan updated successfully!",
    "planRemoved": "Plan removed successfully!",
    "planDeleteBlocked": "The plan cannot be deleted. It is in use by the following companies: {{companies}}.",
    "customerUpdated": "Customer updated successfully!",
    "customerAdded": "Customer added successfully!",
    "customerRemoved": "Customer removed successfully!",
    "customersAddedBatch": "{{count}} new customers were successfully registered.",
    "customersSkippedBatch": "{{count}} contacts were skipped because they already exist as customers.",
    "customerUpdateFailed": "Failed to update customer.",
    "customerAddFailed": "Failed to add customer.",
    "customerRemoveFailed": "Failed to remove customer.",
    "supplierUpdated": "Supplier updated successfully!",
    "supplierAdded": "Supplier added successfully!",
    "supplierRemoved": "Supplier removed successfully!",
    "appointmentUpdated": "Appointment updated successfully!",
    "appointmentAdded": "Appointment scheduled successfully!",
    "notificationsSent": "Update notifications sent via email.",
    "appointmentReopened": "Appointment reopened successfully!",
    "systemLogoUpdated": "System logo updated successfully!",
    "systemLogoRemoved": "System logo removed.",
    "documentAdded": "Document \"{{name}}\" added successfully!",
    "documentRemoved": "Document removed successfully!",
    "companyDataFetched": "Company data autofilled successfully!",
    "ui": {
      "reminder": "Reminder: \"{{title}}\" starts in approx. {{time}}."
    },
    "email": {
      "reminder": {
        "subject": "Appointment Reminder: {{title}}",
        "greeting": "Hello {{name}},",
        "body": "This is a reminder for your upcoming appointment:",
        "titleLabel": "Title",
        "whenLabel": "When",
        "whereLabel": "Location",
        "descriptionLabel": "Description",
        "preparation": "Please be prepared.",
        "sincerely": "Sincerely,"
      },
      "update": {
        "subjectNew": "New Appointment: {{title}}",
        "subjectUpdate": "Appointment Updated: {{title}}",
        "greeting": "Hello {{name}},",
        "bodyNew": "You have been invited to a new appointment:",
        "bodyUpdate": "An appointment you are a part of has been updated. Here are the latest details:"
      },
      "companyStatusUpdate": {
        "subject": "Company Status Update: {{companyName}}",
        "greeting": "Hello {{companyName}} team,",
        "body": "Your company's account status has been updated:",
        "oldStatus": "Previous Status",
        "newStatus": "New Status",
        "reason": "Reason"
      }
    }
  },
  "appointment": {
    "category": {
      "CLIENT_MEETING": "Client Meeting",
      "INTERNAL_TEAM": "Internal Team",
      "SUPPLIER": "Supplier",
      "SALES": "Sales",
      "PERSONAL": "Personal",
      "OTHER": "Other"
    },
    "status": {
      "agendado": "Scheduled",
      "concluido": "Completed"
    }
  },
  "activityLog": {
    "NEW_COMPANY": "New company \"{{name}}\" was added.",
    "UPDATE_COMPANY": "{{description}}",
    "DELETE_COMPANY": "Company \"{{name}}\" and all its data were removed.",
    "NEW_USER": "New user \"{{name}}\" was added.",
    "UPDATE_USER": "{{description}}",
    "UPDATE_USER_PERMISSIONS": "Permissions for user {{name}} were updated.",
    "NEW_CUSTOMER": "New customer \"{{name}}\" was added.",
    "UPDATE_CUSTOMER": "Customer \"{{name}}\" was updated.",
    "DELETE_CUSTOMER": "Customer \"{{name}}\" was removed.",
    "NEW_SUPPLIER": "New supplier \"{{name}}\" was added.",
    "UPDATE_SUPPLIER": "Supplier \"{{name}}\" was updated.",
    "DELETE_SUPPLIER": "Supplier \"{{name}}\" was removed.",
    "NEW_APPOINTMENT_SERIES": "New appointment series \"{{title}}\" was scheduled.",
    "NEW_APPOINTMENT": "New appointment \"{{title}}\" was scheduled.",
    "UPDATE_APPOINTMENT": "{{description}}",
    "NEW_INTERACTION": "New interaction of type \"{{type}}\" logged for \"{{name}}\".",
    "NEW_DOCUMENT": "New document \"{{docName}}\" was added for customer \"{{customerName}}\".",
    "DELETE_DOCUMENT": "Document \"{{docName}}\" was removed from customer \"{{customerName}}\"."
  },
  "icons": {
    "CustomerIcon": "Customer",
    "UsersIcon": "Team",
    "SupplierIcon": "Supplier",
    "BriefcaseIcon": "Sales",
    "TagIcon": "General",
    "HeartIcon": "Personal",
    "AgendaIcon": "Agenda",
    "DashboardIcon": "Dashboard",
    "ReportsIcon": "Reports",
    "SettingsIcon": "Settings",
    "HelpIcon": "Help",
    "CalendarCheckIcon": "Completed",
    "KeyIcon": "Key"
  },
  "avatarSelection": {
    "title": "Choose or Upload an Avatar"
  },
  "iconPicker": {
    "title": "Select Icon"
  },
  "companyStatus": {
    "active": "Active",
    "trial": "Trial",
    "suspended": "Suspended"
  },
  "accountStatus": {
    "suspended": {
      "title": "Account Suspended",
      "body": "Your company's account has been suspended. Please contact support."
    },
    "trialExpired": {
      "title": "Trial Period Expired",
      "body": "Your trial period has ended. To continue using the service, please upgrade to a paid plan or contact your administrator."
    },
    "past_due": {
      "title": "Payment Past Due",
      "body": "Your subscription payment is past due. Please contact your administrator to regularize the situation and restore full access."
    },
    "logout": "Logout"
  },
  "whatsapp": {
    "title": "WhatsApp (Cloud API)",
    "step1": "Step 1: API Configuration",
    "phoneIdLabel": "From Phone Number ID",
    "tokenLabel": "Access Token",
    "saveConfig": "Save Configuration",
    "configSaved": "Configuration saved!",
    "configNotSaved": "Configuration not saved.",
    "configError": "API Configuration is not saved. Please save it first.",
    "step2": "Step 2: Compose Message",
    "templateLabel": "Select a Message Template",
    "templatePlaceholder": "Choose a template...",
    "parametersTitle": "Template Parameters",
    "paramInfo": "The value for {{name}} will be automatically replaced with the contact's name.",
    "step3": "Step 3: Add Contacts",
    "step4": "Step 4: Configure & Send",
    "logTitle": "Sending Log",
    "logEmpty": "Logs will appear here once sending starts.",
    "logSuccess": "SUCCESS: Message sent to {{name}} ({{phone}})",
    "logError": "ERROR sending to {{name}} ({{phone}}): {{error}}",
    "configMissing": {
      "title": "API Configuration Required",
      "message": "The WhatsApp API credentials are not set. Please go to Settings to add them before proceeding.",
      "goToSettings": "Go to Settings"
    },
    "templates": {
      "manageTitle": "Manage Message Templates",
      "createButton": "Create New Template",
      "modalTitleCreate": "Create New Message Template",
      "modalTitleEdit": "Edit Message Template",
      "defaultBadge": "Default",
      "confirmDelete": "Are you sure you want to delete the template '{{name}}'?",
      "deleteErrorDefault": "Default templates cannot be deleted.",
      "form": {
        "nameLabel": "Template Name (Friendly Name)",
        "apiNameLabel": "API Name (e.g., hello_world)",
        "apiNamePlaceholder": "lowercase_and_underscores_only",
        "apiNameError": "API Name can only contain lowercase letters, numbers, and underscores.",
        "bodyLabel": "Message Body",
        "bodyHint": "Use {{1}} for the customer's name, and {{2}}, {{3}}, etc., for other parameters.",
        "paramsLabel": "Detected Parameters"
      },
      "hello_world": {
        "name": "Welcome Message",
        "body": "Hello {{1}}, welcome to our service!"
      },
      "order_update": {
        "name": "Order Status Update",
        "body": "Hi {{1}}, your order #{{2}} has been shipped. The tracking code is {{3}}."
      },
      "appointment_reminder": {
        "name": "Appointment Reminder",
        "body": "Hello {{1}}, this is a reminder for your appointment tomorrow at {{2}}. See you soon!"
      }
    },
    "contactSource": {
      "file": "Import File",
      "manual": "Manual Entry"
    },
    "file": {
      "instructions": "Upload an Excel (.xlsx) or CSV (.csv) file. It must contain 'Name' and 'Phone' columns."
    },
    "manual": {
      "nameLabel": "Name",
      "phoneLabel": "Phone Number (with country code)",
      "addButton": "Add"
    },
    "contactList": {
      "title": "Contacts to Message",
      "empty": "No contacts added yet.",
      "nameHeader": "Name",
      "phoneHeader": "Phone",
      "sendHeader": "Send",
      "saveHeader": "Save",
      "selectAllSend": "Select All to Send",
      "selectAllSave": "Select All to Save",
      "searchPlaceholder": "Filter contacts...",
      "summary": {
        "total": "Total",
        "toSend": "To Send",
        "toSave": "To Save"
      }
    },
    "rateLabel": "Messages per minute",
    "startButton": "Start Sending ({{count}})",
    "stopButton": "Stop Sending",
    "saveButton": "Save Selected ({{count}})",
    "sendingStatus": {
      "sending": "Sending {{current}} of {{total}}...",
      "finished": "Finished! Sent messages to {{count}} contacts.",
      "stopped": "Sending stopped by user."
    }
  }
};
const es = {
  "app": {
    "title": {
      "full": "Centro de Negocios Pro",
      "short": "Centro de Negocios"
    }
  },
  "sidebar": {
    "dashboard": "Panel",
    "customers": "Clientes",
    "suppliers": "Proveedores",
    "agenda": "Agenda",
    "reports": "Informes",
    "whatsapp": "Envíos por WhatsApp",
    "settings": "Configuración",
    "help": "Ayuda"
  },
  "header": {
    "searchPlaceholder": "Buscar...",
    "changeToDarkMode": "Cambiar a modo oscuro",
    "changeToLightMode": "Cambiar a modo claro",
    "appointmentsForToday": "Citas para Hoy",
    "noAppointmentsToday": "No hay citas próximas para hoy.",
    "logout": "Cerrar Sesión",
    "searchResults": {
      "customers": "Clientes",
      "suppliers": "Proveedores",
      "appointments": "Citas",
      "noResults": "No se encontraron resultados."
    },
    "trialBanner": "Te quedan {{days}} días en tu período de prueba.",
    "pastDueBanner": "Tu cuenta tiene un pago pendiente. Por favor, actualiza tu información de pago.",
    "trialExpiredBanner": "Tu período de prueba ha expirado."
  },
  "login": {
    "welcome": "¡Bienvenido de nuevo! Accede a tu cuenta.",
    "emailLabel": "Correo Electrónico",
    "emailPlaceholder": "tu@email.com",
    "passwordLabel": "Contraseña",
    "passwordPlaceholder": "••••••",
    "rememberMe": "Recordarme",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "firstTimeOrForgot": "¿Primera vez? / Olvidé mi contraseña",
    "signIn": "Iniciar Sesión",
    "signingIn": "Iniciando Sesión...",
    "continueWith": "O continuar con",
    "errors": {
      "invalidCredentials": "Correo o contraseña no válidos.",
      "pendingAccount": "Tu cuenta está pendiente de configuración. Por favor, usa el enlace 'Olvidé mi contraseña' para establecer tu contraseña."
    }
  },
  "resetPassword": {
    "title": "Establecer/Restablecer Contraseña",
    "instructions": "Ingresa tu dirección de correo. Te enviaremos un enlace para restablecer tu contraseña.",
    "continue": "Continuar",
    "sendLink": "Enviar Enlace de Restablecimiento",
    "emailNotFound": "No se encontró ninguna cuenta con ese correo.",
    "setNewPasswordTitle": "Establece una Nueva Contraseña",
    "password": "Nueva Contraseña",
    "confirmPassword": "Confirmar Nueva Contraseña",
    "passwordMismatch": "Las contraseñas no coinciden",
    "passwordTooShort": "La contraseña debe tener al menos 6 caracteres.",
    "savePassword": "Guardar Contraseña",
    "success": "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.",
    "successLinkSent": "Si existe una cuenta para este correo, se ha enviado un enlace para restablecer la contraseña.",
    "backToLogin": "Volver al Inicio de Sesión"
  },
  "dashboard": {
    "title": "Panel",
    "cards": {
      "activeCustomers": "Clientes Activos",
      "totalSuppliers": "Total de Proveedores",
      "upcomingAppointments": "Próximas Citas"
    },
    "charts": {
      "customerInteractionsTitle": "Interacciones con Clientes (Últimos 6 meses)",
      "interactions": "Interacciones"
    },
    "upcomingAppointments": {
      "title": "Próximas 5 Citas",
      "none": "No hay próximas citas."
    },
    "recentActivity": {
      "title": "Actividad Reciente",
      "summary": "Aquí se mostrará un resumen de la actividad reciente."
    },
    "calendar": {
      "viewAppointmentsFor": "Ver citas para {{date}}",
      "selectYear": "Seleccionar año"
    }
  },
  "customers": {
    "title": "Clientes",
    "searchPlaceholder": "Buscar por nombre de cliente...",
    "add": "Añadir Cliente",
    "edit": "Editar Cliente",
    "addNew": "Añadir Nuevo Cliente",
    "name": "Nombre",
    "contact": "Contacto",
    "status": "Estado",
    "customerSince": "Cliente Desde",
    "actions": "Acciones",
    "filters": {
      "all": "Todos los Estados",
      "status": "Estado",
      "sort_by": "Ordenar por",
      "sort_options": {
        "date_newest": "Fecha (Más Reciente)",
        "date_oldest": "Fecha (Más Antiguo)",
        "name_asc": "Nombre (A-Z)",
        "name_desc": "Nombre (Z-A)",
        "status": "Estado"
      }
    },
    "noCustomersFound": "No se encontraron clientes.",
    "statusActive": "Activo",
    "statusInactive": "Inactivo",
    "typePerson": "Persona Física",
    "typeCompany": "Empresa",
    "details": "Detalles de {{name}}",
    "fetchError": "Error al buscar clientes.",
    "confirmDelete": {
      "title": "Confirmar Eliminación",
      "header": "Eliminar Cliente",
      "body": "¿Estás seguro de que quieres eliminar a <strong>{{name}}</strong>? Esta acción es permanente y no se puede deshacer."
    },
    "deleteBlocked": {
      "title": "Eliminación Bloqueada",
      "body": "Este cliente no puede ser eliminado. Está asociado a {{count}} cita(s). Por favor, elimínelo de las citas antes de borrarlo."
    },
    "analysis": {
      "title": "Análisis de Interacciones con {{name}}",
      "button": "Analizar con IA"
    },
    "form": {
      "fullName": "Nombre Completo",
      "companyName": "Razón Social",
      "email": "Correo Electrónico",
      "type": "Tipo",
      "cnpj": "CUIT",
      "cpf": "DNI",
      "phone": "Teléfono",
      "cep": "Código Postal",
      "address": "Dirección",
      "status": "Estado",
      "province": "Provincia",
      "companyLogo": "Logo de la Empresa",
      "uploadLogo": "Subir Logo",
      "logoHint": "Si no se sube un logo, se usarán las iniciales de la empresa.",
      "avatar": "Avatar",
      "changeAvatar": "Cambiar Avatar",
      "errors": {
        "invalidDni": "DNI no válido. Por favor, revise el número ingresado.",
        "invalidCuit": "CUIT no válido. Por favor, revise el número ingresado.",
        "cepNotFound": "Código postal no encontrado.",
        "cepError": "Error al buscar la dirección para el código postal.",
        "invalidCpa": "CPA (código postal argentino) no válido.",
        "invalidCpf": "DNI no válido. Por favor, revise el número ingresado.",
        "invalidCnpj": "CUIT no válido. Por favor, revise el número ingresado."
      }
    },
    "detailsView": {
      "tabs": {
        "details": "Detalles",
        "interactions": "Interacciones",
        "documents": "Documentos"
      },
      "addInteraction": {
        "title": "Registrar Nueva Interacción",
        "placeholder": "Describe la interacción aquí...",
        "typeLabel": "Tipo:",
        "types": {
          "call": "Llamada",
          "email": "Correo",
          "meeting": "Reunión",
          "note": "Nota"
        }
      },
      "noInteractions": "No hay interacciones registradas.",
      "documents": {
        "title": "Documentos del Cliente",
        "upload": "Subir Documento",
        "noDocuments": "No hay documentos subidos.",
        "confirmDelete": {
          "title": "Confirmar Eliminación de Documento",
          "body": "¿Estás seguro de que quieres eliminar el documento <strong>{{name}}</strong>?"
        }
      }
    }
  },
  "suppliers": {
    "title": "Proveedores",
    "searchPlaceholder": "Buscar por nombre de empresa o contacto...",
    "add": "Añadir Proveedor",
    "edit": "Editar Proveedor",
    "addNew": "Añadir Nuevo Proveedor",
    "companyName": "Razón Social",
    "contact": "Contacto",
    "services": "Servicios",
    "actions": "Acciones",
    "noSuppliersFound": "No se encontraron proveedores.",
    "viewDetails": "Ver Detalles",
    "detailsOf": "Detalles de {{name}}",
    "confirmDelete": {
      "title": "Confirmar Eliminación",
      "header": "Eliminar Proveedor",
      "body": "¿Estás seguro de que quieres eliminar a <strong>{{name}}</strong>? Esta acción es permanente y no se puede deshacer."
    },
    "deleteBlocked": {
      "title": "Eliminación Bloqueada",
      "body": "Este proveedor no puede ser eliminado. Está asociado a {{count}} cita(s). Por favor, elimina la asociación antes de borrarlo."
    },
    "form": {
      "companyData": "Datos de la Empresa",
      "companyLogo": "Logo de la Empresa",
      "uploadLogo": "Subir Logo",
      "logoHint": "Si no se sube un logo, se usarán las iniciales.",
      "companyName": "Razón Social",
      "cnpj": "CUIT",
      "cep": "Código Postal",
      "address": "Dirección",
      "province": "Provincia",
      "contactInfo": "Información de Contacto",
      "contactPerson": "Persona de Contacto",
      "contactAvatar": "Avatar de Contacto",
      "changeAvatar": "Cambiar Avatar",
      "fullName": "Nombre Completo",
      "email": "Correo Electrónico",
      "phone": "Teléfono",
      "services": "Servicios (separados por coma)",
      "errors": {
        "invalidCuit": "CUIT no válido. Por favor, revise el número ingresado.",
        "cepNotFound": "Código postal no encontrado.",
        "cepError": "Error al buscar la dirección para el código postal.",
        "invalidCpa": "CPA (código postal argentino) no válido.",
        "invalidCnpj": "CUIT no válido. Por favor, revise el número ingresado.",
        "cnpjNotFound": "CUIT no encontrado.",
        "cnpjError": "Error al buscar datos del CUIT."
      }
    }
  },
  "agenda": {
    "title": "Agenda",
    "add": "Nueva Cita",
    "edit": "Editar Cita",
    "viewCompleted": "Ver Completadas",
    "allAppointments": "Todas las Citas",
    "more": "más",
    "noAppointmentsInCategory": "No hay citas en esta categoría.",
    "views": {
      "board": "Tablero",
      "list": "Lista",
      "month": "Mes",
      "week": "Semana",
      "day": "Día"
    },
    "searchPlaceholder": "Buscar por título...",
    "filter": {
      "allCustomers": "Todos los Clientes",
      "allSuppliers": "Todos los Proveedores"
    },
    "board": {
      "overdue": "Pendientes (Atrasadas)",
      "today": "Hoy",
      "tomorrow": "Mañana",
      "next7Days": "Próximos 7 Días",
      "future": "Futuro",
      "completed": "Completadas",
      "viewAll": "Ver Todas ({{count}})"
    },
    "noScheduledAppointments": "No se encontraron citas programadas para los filtros seleccionados.",
    "details": {
      "title": "Detalles",
      "history": "Historial",
      "noDescription": "No se proporcionó descripción.",
      "dateTime": "Fecha y Hora:",
      "location": "Ubicación:",
      "notSpecified": "No especificado",
      "dueDate": "Fecha de Vencimiento:",
      "participants": "Participantes:",
      "attachments": "Archivos Adjuntos:",
      "reopen": "Reabrir",
      "aiSummary": "Resumen IA",
      "edit": "Editar",
      "modifiedBy": "Modificado por",
      "previousData": "Datos anteriores",
      "subtasks": "Subtareas",
      "subtaskProgress": "Progreso de Subtareas",
      "deleteSubtask": "Eliminar subtarea",
      "confirmDeleteSubtask": {
        "title": "Eliminar Subtarea",
        "body": "¿Estás seguro de que quieres eliminar la subtarea '<strong>{{name}}</strong>'? Esta acción no se puede deshacer."
      },
      "addSubtaskPlaceholder": "Añadir nueva subtarea..."
    },
    "form": {
      "generalInfo": "Información General",
      "title": "Título",
      "description": "Descripción",
      "dateAndTime": "Fecha y Hora",
      "start": "Inicio",
      "end": "Fin",
      "dueDate": "Fecha de Vencimiento (Opcional)",
      "repeat": "Repetir cita",
      "frequency": "Frecuencia",
      "repeatUntil": "Repetir hasta",
      "frequencies": {
        "daily": "Diariamente",
        "weekly": "Semanalmente",
        "monthly": "Mensualmente",
        "yearly": "Anualmente"
      },
      "detailsAndAssociations": "Detalles y Asociaciones",
      "location": "Ubicación",
      "category": "Categoría",
      "reminder": "Recordatorio",
      "reminders": {
        "none": "Ninguno",
        "5": "5 minutos antes",
        "15": "15 minutos antes",
        "30": "30 minutos antes",
        "60": "1 hora antes",
        "1440": "1 día antes"
      },
      "relatedCustomer": "Cliente Relacionado",
      "noCustomer": "Ninguno",
      "relatedSupplier": "Proveedor Relacionado",
      "noSupplier": "Ninguno",
      "participantsAndAttachments": "Participantes y Adjuntos",
      "teamParticipants": "Participantes del Equipo",
      "searchTeam": "Buscar en el equipo...",
      "attachments": "Archivos Adjuntos",
      "addFiles": "Añadir Archivos",
      "notify": "Notificar a los participantes por correo",
      "noParticipants": "No hay participantes añadidos.",
      "addParticipant": "Añadir Participante",
      "noUsersFound": "No se encontraron usuarios.",
      "errors": {
        "general": "Por favor, complete el título y las fechas de inicio y fin.",
        "invalidDate": "La fecha/hora de inicio o fin no es válida.",
        "endBeforeStart": "La fecha de fin debe ser posterior a la de inicio.",
        "dueAfterStart": "La fecha de vencimiento debe ser posterior a la de inicio.",
        "recurrenceEnd": "Por favor, establezca una fecha final para la recurrencia."
      }
    },
    "completed": {
      "title": "Historial de Citas Completadas",
      "searchPlaceholder": "Buscar por título...",
      "completedOn": "Completada el: {{date}}",
      "noCompleted": "No se encontraron citas completadas."
    },
    "summary": {
      "title": "Resumen de {{title}}"
    }
  },
  "reports": {
    "title": "Informes y Exportaciones",
    "exportPDF": "Exportar PDF",
    "exportExcel": "Exportar Excel",
    "startDate": "Fecha de Inicio",
    "endDate": "Fecha de Fin",
    "tabs": {
      "appointments": "Citas",
      "customers": "Clientes",
      "suppliers": "Proveedores",
      "activity": "Historial de Actividad"
    },
    "appointments": {
      "title": "Informe de Citas",
      "fileName": "Informe_Citas",
      "table": {
        "title": "Título",
        "dateTime": "Fecha y Hora",
        "dueDate": "Vencimiento",
        "location": "Ubicación",
        "participants": "Participantes"
      }
    },
    "customers": {
      "title": "Informe de Clientes",
      "fileName": "Informe_Clientes",
      "statusChartTitle": "Estado de los Clientes",
      "listTitle": "Lista de Clientes",
      "table": {
        "name": "Nombre",
        "status": "Estado",
        "email": "Correo",
        "phone": "Teléfono",
        "type": "Tipo"
      }
    },
    "suppliers": {
      "title": "Informe de Proveedores por Categoría",
      "fileName": "Informe_Proveedores",
      "table": {
        "category": "Categoría",
        "supplier": "Proveedor",
        "contact": "Contacto",
        "email": "Correo",
        "cnpj": "CUIT"
      }
    },
    "activity": {
      "title": "Historial de Actividad",
      "fileName": "Registro_de_Actividad",
      "type": "Tipo de Actividad",
      "allTypes": "Todos los Tipos",
      "table": {
        "date": "Fecha",
        "type": "Tipo",
        "description": "Descripción"
      }
    }
  },
  "settings": {
    "title": "Configuración",
    "tabs": {
      "myCompany": "Mi Empresa",
      "users": "Usuarios",
      "categories": "Categorías",
      "companies": "Empresas",
      "plans": "Planes",
      "permissions": "Permisos",
      "systemCustomization": "Personalización",
      "integrations": "Integraciones"
    },
    "customization": {
      "title": "Personalización del Sistema",
      "logoTitle": "Logo del Sistema (Pantalla de Inicio)",
      "logoDescription": "Este logo aparecerá en la pantalla de inicio de sesión para todos los usuarios.",
      "changeLogo": "Cambiar Logo",
      "removeLogo": "Quitar Logo",
      "noLogo": "Sin logo definido"
    },
    "company": {
      "title": "Información de la Empresa",
      "editTitle": "Editar Información de la Empresa",
      "editButton": "Editar",
      "logo": "Logo de la Empresa",
      "name": "Nombre de la Empresa",
      "cnpj": "CUIT",
      "address": "Dirección",
      "contactEmail": "Correo de Contacto",
      "phone": "Teléfono",
      "changeLogo": "Cambiar Logo",
      "errors": {
        "invalidFormat": "Formato de archivo no válido. Utilice JPG, PNG o SVG.",
        "fileTooLarge": "El archivo es demasiado grande. El límite es de {{limit}}MB.",
        "uploadFailed": "Ocurrió un error al leer el archivo."
      }
    },
    "users": {
      "title": "Gestión de Usuarios",
      "add": "Añadir Usuario",
      "edit": "Editar Usuario",
      "addNew": "Añadir Nuevo Usuario",
      "sendPasswordReset": "Enviar redefinición de contraseña",
      "table": {
        "name": "Nombre",
        "role": "Rol",
        "company": "Empresa",
        "actions": "Acciones"
      },
      "form": {
        "fullName": "Nombre Completo",
        "email": "Correo Electrónico",
        "role": "Rol",
        "company": "Empresa",
        "selectCompany": "Seleccione una empresa",
        "avatar": "Cambiar Avatar",
        "roles": {
          "admin": "Administrador",
          "manager": "Gerente",
          "collaborator": "Colaborador"
        },
        "errors": {
          "selectCompany": "Por favor, seleccione una empresa para el nuevo usuario."
        }
      }
    },
    "companies": {
      "title": "Gestión de Empresas",
      "searchPlaceholder": "Buscar por nombre o CUIT...",
      "add": "Añadir Empresa",
      "edit": "Editar Empresa",
      "detailsTab": "Detalles",
      "historyTab": "Historial",
      "reasonForChange": "Motivo del Cambio (Obligatorio)",
      "noHistory": "No se han registrado cambios de estado para esta empresa.",
      "historyTable": {
        "date": "Fecha",
        "changedBy": "Cambiado Por",
        "newStatus": "Cambio",
        "reason": "Motivo"
      },
      "history": {
        "changedStatus": "cambió el estado de <strong>{{old}}</strong> a <strong>{{new}}</strong>."
      },
      "table": {
        "name": "Nombre de la Empresa",
        "cnpj": "CUIT",
        "actions": "Acciones",
        "status": "Estado",
        "trialEnds": "Fin de Prueba"
      },
      "enableTrial": "Activar período de prueba",
      "trialDuration": "Duración de la Prueba (días)",
      "adminInfo": "Información del Administrador",
      "deleteWarning": "La empresa principal 'Business Hub Pro Inc.' no se puede eliminar por seguridad.",
      "confirmDeleteTitle": "Confirmar Eliminación de Empresa",
      "confirmDelete": "¿Estás seguro de que quieres eliminar la empresa \"{{name}}\"? Todos los datos asociados (usuarios, clientes, etc.) se eliminarán permanentemente."
    },
     "plans": {
      "title": "Gestión de Planes",
      "add": "Añadir Plan",
      "edit": "Editar Plan",
      "addNew": "Añadir Nuevo Plan",
      "currentPlan": "Plan Actual",
      "perMonth": "/mes",
      "userLimit": "{{count}} Usuarios",
      "customerLimit": "{{count}} Clientes",
      "noPlansTitle": "No hay planes creados todavía",
      "noPlansDescription": "Empieza por crear tu primer plan de suscripción.",
      "createFirstPlan": "Crear Primer Plan",
      "form": {
        "name": "Nombre del Plan",
        "price": "Precio (mensual)",
        "userLimit": "Límite de Usuarios",
        "customerLimit": "Límite de Clientes",
        "hasWhatsApp": "Habilitar Módulo WhatsApp",
        "hasAI": "Habilitar Funciones de IA",
        "allowBranding": "Permitir Personalización de Marca"
      },
       "features": {
        "whatsApp": "Módulo WhatsApp",
        "ai": "Funciones de IA",
        "branding": "Personalización de Marca (Logo)"
      },
      "confirmDeleteTitle": "Confirmar Eliminación del Plan",
      "confirmDeleteBody": "¿Estás seguro de que quieres eliminar el plan '{{name}}'?",
      "deleteBlockedTitle": "Eliminación Bloqueada",
      "deleteBlockedBody": "Este plan no se puede eliminar ya que está asignado a las siguientes empresas: {{companies}}."
    },
    "categories": {
      "title": "Categorías de Citas",
      "save": "Guardar Cambios",
      "new": "Nueva Categoría",
      "deleteWarning": "Debe haber al menos una categoría.",
      "confirmDelete": "¿Estás seguro de que quieres eliminar la categoría \"{{name}}\"?.",
      "errors": {
        "emptyName": "El nombre de la categoría no puede estar vacío.",
        "duplicateName": "El nombre de la categoría \"{{name}}\" está duplicado."
      },
      "tooltips": {
        "cannotEditName": "Los nombres de las categorías predeterminadas no se pueden cambiar, ya que se utilizan para las traducciones del sistema.",
        "cannotDelete": "Las categorías predeterminadas no se pueden eliminar."
      }
    },
    "permissions": {
      "title": "Permisos Detallados de Usuario",
      "selectUser": "Seleccione un Usuario",
      "editingFor": "Editando permisos para: {{name}}",
      "selectUserPrompt": "Seleccione un usuario para ver y editar sus permisos.",
      "save": "Guardar Permisos",
      "groups": {
        "dashboard": "Panel",
        "customers": "Clientes",
        "suppliers": "Proveedores",
        "agenda": "Agenda",
        "reports": "Informes",
        "settings": "Configuración",
        "superAdmin": "Administración General"
      },
      "descriptions": {
        "VIEW_DASHBOARD": "Ver panel",
        "VIEW_CUSTOMERS": "Ver clientes",
        "MANAGE_CUSTOMERS": "Añadir/Editar clientes",
        "DELETE_CUSTOMERS": "Eliminar clientes",
        "VIEW_SUPPLIERS": "Ver proveedores",
        "MANAGE_SUPPLIERS": "Añadir/Editar proveedores",
        "DELETE_SUPPLIERS": "Eliminar proveedores",
        "VIEW_AGENDA": "Ver agenda",
        "MANAGE_AGENDA": "Gestionar agenda (crear/editar eventos)",
        "VIEW_REPORTS": "Ver informes",
        "VIEW_SETTINGS": "Acceder a configuración",
        "MANAGE_COMPANY_INFO": "Editar información de la propia empresa",
        "MANAGE_USERS": "Gestionar usuarios de la propia empresa",
        "MANAGE_CATEGORIES": "Gestionar categorías de citas",
        "MANAGE_ALL_USERS": "Gestionar usuarios de CUALQUIER empresa",
        "MANAGE_PLANS": "Gestionar planes de suscripción"
      }
    }
  },
  "help": {
    "title": "Centro de Ayuda",
    "intro": "¡Bienvenido! Aquí encontrarás guías sobre cómo usar las funcionalidades del Centro de Negocios.",
    "downloadManual": "Descargar Manual en PDF",
    "manualFilename": "Manual_BusinessHubPro.pdf",
    "sections": {
      "dashboard": {
        "title": "Panel Principal",
        "content": "<p>El Panel es tu pantalla de inicio, diseñada para ofrecer una vista general y rápida de la información más importante de tu negocio.</p><h4>Componentes Principales:</h4><ul><li><strong>Tarjetas de Estadísticas:</strong> En la parte superior, ves números clave como el total de clientes activos, proveedores y tus próximas citas. Estas tarjetas sirven como un termómetro diario de tu operación.</li><li><strong>Gráfico de Nuevos Clientes:</strong> Este gráfico muestra el crecimiento de tu base de clientes en los últimos meses, permitiendo identificar tendencias de adquisición.</li><li><strong>Lista de Próximas Citas:</strong> Un resumen rápido de tus próximos eventos programados para el día, asegurando que nunca te pierdas un compromiso importante.</li></ul>"
      },
      "customers": {
        "title": "Gestión de Clientes",
        "content": "<h4>Viendo la Lista de Clientes</h4><p>En esta pantalla, verás una tabla con todos tus clientes. Usa la barra de búsqueda en la parte superior para encontrar un cliente específico por nombre.</p><h4>Añadiendo un Nuevo Cliente</h4><ol><li>Haz clic en el botón azul <strong>\\\"+ Añadir Cliente\\\"</strong> en la esquina superior derecha.</li><li>Completa el formulario. El sistema valida automáticamente el DNI/CUIT para garantizar la integridad de los datos.</li><li>Para clientes persona física, puedes elegir un avatar predefinido o subir una foto.</li><li>Después de completar, haz clic en \\\"Añadir Cliente\\\" para guardar.</li></ol><h4>Viendo Detalles e Interacciones</h4><ul><li>Haz clic en cualquier cliente de la lista para abrir una ventana con sus detalles completos.</li><li>Navega a la pestaña \\\"Interacciones\\\" para ver todo el historial de contactos, como llamadas, correos y reuniones.</li><li>Puedes registrar una nueva interacción directamente en esta pestaña.</li></ul><h4>Análisis con IA</h4><p>En la pestaña de interacciones, si hay un historial de contactos, puedes usar el botón <strong>\\\"Analizar con IA\\\"</strong>. La inteligencia artificial leerá las interacciones y generará un resumen estratégico, identificando el sentimiento del cliente, oportunidades de negocio y sugiriendo próximos pasos.</p>"
      },
      "suppliers": {
        "title": "Gestión de Proveedores",
        "content": "<p>La gestión de proveedores se centraliza en esta pantalla, funcionando de manera muy similar a la de clientes. Puedes registrar socios, información de contacto y los servicios que prestan.</p><ul><li>Usa el botón <strong>\\\"+ Añadir Proveedor\\\"</strong> para registrar un nuevo socio.</li><li>Completa los datos de la empresa así como la información de la persona de contacto principal.</li><li>Es posible ver, editar o eliminar un proveedor usando los iconos en la lista.</li></ul>"
      },
      "agenda": {
        "title": "Usando la Agenda",
        "content": "<h4>Visualizaciones de la Agenda</h4><p>La agenda ofrece múltiples formas de ver tus citas. Usa los botones en la esquina superior derecha para alternar entre las visualizaciones:</p><ul><li><strong>Tablero (Kanban):</strong> Ideal para la planificación semanal. Organiza citas en columnas como \\\"Hoy\\\", \\\"Mañana\\\", y \\\"Próximos 7 Días\\\". Arrastra y suelta tarjetas para reprogramar citas de forma intuitiva.</li><li><strong>Lista:</strong> Una vista cronológica de todas tus citas futuras.</li><li><strong>Mes, Semana, Día:</strong> Vistas de calendario clásicas para planificación a corto y largo plazo.</li></ul><h4>Creando y Gestionando Citas</h4><ol><li>Haz clic en el botón <strong>\\\"+ Nueva Cita\\\"</strong>.</li><li>Completa los detalles como título, descripción, fecha/hora de inicio y fin.</li><li>Asocia citas a clientes o proveedores para mantener un historial integrado.</li><li>Adjunta archivos importantes y configura recurrencias para eventos regulares (diario, semanal, etc.).</li><li>Marca una cita como completada directamente en el tablero o en la lista.</li><li><strong>Añade subtareas</strong> para detallar actividades. Márcalas como completadas y sigue el progreso a través de indicadores visuales en el tablero y una barra de progreso en la vista de detalles.</li></ol><h4>Historial y Resumen con IA</h4><p>Accede al \\\"Historial\\\" para ver todas las citas ya completadas. Para cualquier cita en el historial, haz clic en <strong>\\\"Resumen IA\\\"</strong>. El sistema generará un resumen profesional de la reunión, ideal para actas y seguimientos.</p>"
      },
      "reports": {
        "title": "Informes y Exportaciones",
        "content": "<p>Esta sección te permite visualizar datos consolidados y exportarlos para usar en otras herramientas o para presentaciones.</p><ul><li><strong>Navega por las Pestañas:</strong> Elige entre informes de Citas, Clientes, Proveedores o Historial de Actividad.</li><li><strong>Filtra los Datos:</strong> En cada informe, puedes usar filtros, como rangos de fechas, para centrarte en los datos que más importan.</li><li><strong>Exporta en PDF o Excel:</strong> Para cada informe, encontrarás botones para \\\"Exportar PDF\\\" (ideal para imprimir y compartir) y \\\"Exportar Excel\\\" (ideal si necesitas manipular los datos en hojas de cálculo).</li></ul>"
      },
      "settings": {
        "title": "Configuración",
        "content": "<p>Personaliza el sistema para satisfacer las necesidades de tu equipo y empresa.</p><ul><li><strong>Mi Empresa:</strong> Actualiza los datos de registro de tu empresa, como dirección, teléfono y CUIT.</li><li><strong>Usuarios:</strong> Añade nuevos miembros de tu equipo al sistema, edita su información y establece sus permisos (Administrador, Gerente, Colaborador).</li><li><strong>Categorías:</strong> Personaliza las categorías de citas. Puedes renombrar, cambiar iconos y colores para que se adapten mejor a tu organización.</li><li><strong>Empresas (Super Admin):</strong> Si eres un superadministrador, verás una pestaña adicional para gestionar todas las empresas registradas en el sistema.</li></ul>"
      },
      "faq": {
        "title": "Preguntas Frecuentes (FAQ)",
        "q1": "¿Qué hago si olvido mi contraseña?",
        "a1": "Actualmente, la recuperación de contraseña aún no está automatizada. Por favor, contacta al administrador del sistema en tu empresa para solicitar una nueva contraseña temporal.",
        "q2": "¿Puedo usar el sistema en mi teléfono o tableta?",
        "a2": "¡Sí! \\\"Business Hub Pro\\\" fue diseñado para ser responsivo, lo que significa que se adapta a diferentes tamaños de pantalla. La experiencia puede ser ligeramente diferente, pero todas las características principales estarán disponibles.",
        "q3": "¿Cómo funciona la búsqueda en la barra superior?",
        "a3": "La barra de búsqueda en la parte superior de la pantalla es una herramienta poderosa. Comienza a escribir el nombre de un cliente, proveedor o el título de una cita, y los resultados aparecerán automáticamente. Hacer clic en un resultado te llevará directamente a la página correspondiente.",
        "q4": "¿Qué muestra la campana de notificaciones?",
        "a4": "El ícono de la campana muestra un número que representa cuántas citas tienes programadas para el resto del día de hoy. Al hacer clic, se abre una lista rápida de estas citas."
      }
    }
  },
  "common": {
    "save": "Guardar",
    "saving": "Guardando...",
    "cancel": "Cancelar",
    "saveChanges": "Guardar Cambios",
    "add": "Añadir",
    "edit": "Editar",
    "delete": "Eliminar",
    "close": "Cerrar",
    "ok": "Aceptar",
    "actions": "Acciones",
    "today": "Hoy",
    "unknownUser": "Usuario Desconhecido",
    "uploadedOn": "Subido el {{date}}",
    "confirmDiscard": "Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?",
    "time": {
      "minute": "{{count}} minuto",
      "minutes": "{{count}} minutos",
      "hour": "{{count}} hora",
      "hours": "{{count}} horas",
      "day": "{{count}} día",
      "days": "{{count}} días"
    }
  },
  "notifications": {
    "companyUpdated": "¡Información de la empresa actualizada con éxito!",
    "userUpdated": "¡Usuario actualizado con éxito!",
    "userAdded": "¡Usuario añadido con éxito!",
    "userAddedWithReset": "¡Usuario añadido! Debe usar el enlace 'Olvidé mi contraseña' para establecer su contraseña.",
    "companyAdded": "¡Empresa añadida con éxito!",
    "companyRemoved": "¡Empresa eliminada con éxito!",
    "categoriesSaved": "¡Categorías guardadas con éxito!",
    "permissionsSaved": "¡Permisos guardados con éxito!",
    "customerUpdated": "¡Cliente actualizado con éxito!",
    "customerAdded": "¡Cliente añadido con éxito!",
    "customerRemoved": "¡Cliente eliminado con éxito!",
    "customerUpdateFailed": "Error al actualizar el cliente.",
    "customerAddFailed": "Error al añadir el cliente.",
    "customerRemoveFailed": "Error al eliminar el cliente.",
    "supplierUpdated": "¡Proveedor actualizado con éxito!",
    "supplierAdded": "¡Proveedor añadido con éxito!",
    "supplierRemoved": "¡Proveedor eliminado con éxito!",
    "appointmentUpdated": "¡Cita actualizada con éxito!",
    "appointmentAdded": "¡Cita programada con éxito!",
    "notificationsSent": "Notificaciones de actualización enviadas por correo electrónico.",
    "appointmentReopened": "¡Cita reabierta con éxito!",
    "systemLogoUpdated": "¡Logo del sistema actualizado con éxito!",
    "systemLogoRemoved": "Logo del sistema eliminado.",
    "documentAdded": "¡Documento \"{{name}}\" añadido con éxito!",
    "documentRemoved": "¡Documento eliminado con éxito!",
    "companyDataFetched": "¡Datos de la empresa completados automáticamente!",
    "ui": {
      "reminder": "Recordatorio: \"{{title}}\" comienza en aprox. {{time}}."
    },
    "email": {
      "reminder": {
        "subject": "Recordatorio de Cita: {{title}}",
        "greeting": "Hola {{name}},",
        "body": "Este es un recordatorio para tu próxima cita:",
        "titleLabel": "Título",
        "whenLabel": "Cuándo",
        "whereLabel": "Ubicación",
        "descriptionLabel": "Descripción",
        "preparation": "Por favor, prepárate.",
        "sincerely": "Atentamente,"
      },
      "update": {
        "subjectNew": "Nueva Cita: {{title}}",
        "subjectUpdate": "Cita Actualizada: {{title}}",
        "greeting": "Hola {{name}},",
        "bodyNew": "Has sido invitado a una nueva cita:",
        "bodyUpdate": "Una cita de la que eres parte ha sido actualizada. Aquí están los últimos detalles:"
      },
      "companyStatusUpdate": {
        "subject": "Actualización de Estado de la Empresa: {{companyName}}",
        "greeting": "Hola equipo de {{companyName}},",
        "body": "El estado de la cuenta de su empresa ha sido actualizado:",
        "oldStatus": "Estado Anterior",
        "newStatus": "Nuevo Estado",
        "reason": "Motivo"
      }
    }
  },
  "appointment": {
    "category": {
      "CLIENT_MEETING": "Reunión con Cliente",
      "INTERNAL_TEAM": "Equipo Interno",
      "SUPPLIER": "Proveedor",
      "SALES": "Ventas",
      "PERSONAL": "Personal",
      "OTHER": "Otro"
    },
    "status": {
      "agendado": "Programado",
      "concluido": "Completado"
    }
  },
  "activityLog": {
    "NEW_COMPANY": "Nueva empresa \"{{name}}\" fue añadida.",
    "UPDATE_COMPANY": "{{description}}",
    "DELETE_COMPANY": "La empresa \"{{name}}\" y todos sus datos fueron eliminados.",
    "NEW_USER": "Nuevo usuario \"{{name}}\" fue añadido.",
    "UPDATE_USER": "{{description}}",
    "UPDATE_USER_PERMISSIONS": "Se actualizaron los permisos para el usuario {{name}}.",
    "NEW_CUSTOMER": "Nuevo cliente \"{{name}}\" fue añadido.",
    "UPDATE_CUSTOMER": "Cliente \"{{name}}\" fue actualizado.",
    "DELETE_CUSTOMER": "Cliente \"{{name}}\" fue eliminado.",
    "NEW_SUPPLIER": "Nuevo proveedor \"{{name}}\" fue añadido.",
    "UPDATE_SUPPLIER": "Proveedor \"{{name}}\" fue actualizado.",
    "DELETE_SUPPLIER": "Proveedor \"{{name}}\" fue eliminado.",
    "NEW_APPOINTMENT_SERIES": "Nueva serie de citas \"{{title}}\" fue programada.",
    "NEW_APPOINTMENT": "Nueva cita \"{{title}}\" fue programada.",
    "UPDATE_APPOINTMENT": "{{description}}",
    "NEW_INTERACTION": "Nueva interacción de tipo \"{{type}}\" registrada para \"{{name}}\".",
    "NEW_DOCUMENT": "Nuevo documento \"{{docName}}\" fue añadido para el cliente \"{{customerName}}\".",
    "DELETE_DOCUMENT": "El documento \"{{docName}}\" fue eliminado del cliente \"{{customerName}}\"."
  },
  "icons": {
    "CustomerIcon": "Cliente",
    "UsersIcon": "Equipo",
    "SupplierIcon": "Proveedor",
    "BriefcaseIcon": "Ventas",
    "TagIcon": "General",
    "HeartIcon": "Personal",
    "AgendaIcon": "Agenda",
    "DashboardIcon": "Panel",
    "ReportsIcon": "Informes",
    "SettingsIcon": "Configuración",
    "HelpIcon": "Ayuda",
    "CalendarCheckIcon": "Completado"
  },
  "avatarSelection": {
    "title": "Elige o Sube un Avatar"
  },
  "iconPicker": {
    "title": "Seleccionar Ícono"
  },
  "companyStatus": {
    "active": "Activo",
    "trial": "En Prueba",
    "suspended": "Suspendido"
  },
  "accountStatus": {
    "suspended": {
      "title": "Cuenta Suspendida",
      "body": "La cuenta de su empresa ha sido suspendida. Por favor, contacte con el soporte."
    },
    "trialExpired": {
      "title": "Período de Prueba Expirado",
      "body": "Su período de prueba ha terminado. Para continuar usando el servicio, por favor actualice a un plan de pago o contacte a su administrador."
    },
    "past_due": {
      "title": "Pago Vencido",
      "body": "El pago de su suscripción está vencido. Por favor, contacte a su administrador para regularizar la situación y restaurar el acceso completo."
    },
    "logout": "Cerrar Sesión"
  },
  "whatsapp": {
    "title": "WhatsApp (API Cloud)",
    "step1": "Paso 1: Configuración de la API",
    "phoneIdLabel": "ID del Número de Teléfono (Origen)",
    "tokenLabel": "Token de Acceso",
    "saveConfig": "Guardar Configuración",
    "configSaved": "¡Configuración guardada!",
    "configNotSaved": "Configuración no guardada.",
    "configError": "La configuración de la API no está guardada. Por favor, guárdela primero.",
    "step2": "Paso 2: Redactar Mensaje",
    "templateLabel": "Seleccionar una Plantilla de Mensaje",
    "templatePlaceholder": "Elija una plantilla...",
    "parametersTitle": "Parámetros de la Plantilla",
    "paramInfo": "El valor para {{1}} será reemplazado automáticamente por el nombre del contacto.",
    "step3": "Paso 3: Añadir Contactos",
    "step4": "Paso 4: Configurar y Enviar",
    "logTitle": "Registro de Envío",
    "logEmpty": "Los registros aparecerán aquí una vez que comience el envío.",
    "logSuccess": "ÉXITO: Mensaje enviado a {{name}} ({{phone}})",
    "logError": "ERROR al enviar a {{name}} ({{phone}}): {{error}}",
    "configMissing": {
      "title": "Configuración de API Requerida",
      "message": "Las credenciales de la API de WhatsApp no están configuradas. Por favor, vaya a Configuración para añadirlas antes de proceder.",
      "goToSettings": "Ir a Configuración"
    },
    "templates": {
      "manageTitle": "Gestionar Plantillas de Mensajes",
      "createButton": "Crear Nueva Plantilla",
      "modalTitleCreate": "Crear Nueva Plantilla de Mensaje",
      "modalTitleEdit": "Editar Plantilla de Mensaje",
      "defaultBadge": "Predeterminada",
      "confirmDelete": "¿Estás seguro de que quieres eliminar la plantilla '{{name}}'?",
      "deleteErrorDefault": "Las plantillas predeterminadas no se pueden eliminar.",
      "form": {
        "nameLabel": "Nombre de la Plantilla (Amigable)",
        "apiNameLabel": "Nombre en la API (ej: hello_world)",
        "apiNamePlaceholder": "solo_minusculas_y_guiones_bajos",
        "apiNameError": "El Nombre en la API solo puede contener letras minúsculas, números y guiones bajos.",
        "bodyLabel": "Cuerpo del Mensaje",
        "bodyHint": "Usa {{1}} para el nombre del cliente, y {{2}}, {{3}}, etc., para otros parámetros.",
        "paramsLabel": "Parámetros Detectados"
      },
      "hello_world": {
        "name": "Mensaje de Bienvenida",
        "body": "¡Hola {{1}}, bienvenido a nuestro servicio!"
      },
      "order_update": {
        "name": "Actualización de Pedido",
        "body": "Hola {{1}}, tu pedido nº{{2}} ha sido enviado. El código de seguimiento es {{3}}."
      },
      "appointment_reminder": {
        "name": "Recordatorio de Cita",
        "body": "Hola {{1}}, este es un recordatorio para tu cita mañana a las {{2}}. ¡Nos vemos pronto!"
      }
    },
    "contactSource": {
      "file": "Importar Archivo",
      "manual": "Entrada Manual"
    },
    "file": {
      "instructions": "Sube un archivo Excel (.xlsx) o CSV (.csv). Debe contener las columnas 'Nombre' y 'Teléfono'."
    },
    "manual": {
      "nameLabel": "Nombre",
      "phoneLabel": "Número de Teléfono (con código de país)",
      "addButton": "Añadir"
    },
    "contactList": {
      "title": "Contactos para Envío",
      "empty": "Aún no se han añadido contactos.",
      "nameHeader": "Nombre",
      "phoneHeader": "Teléfono",
      "sendHeader": "Enviar",
      "saveHeader": "Guardar",
      "selectAllSend": "Seleccionar Todos para Enviar",
      "selectAllSave": "Seleccionar Todos para Guardar",
      "searchPlaceholder": "Filtrar contactos...",
      "summary": {
        "total": "Total",
        "toSend": "Para Enviar",
        "toSave": "Para Guardar"
      }
    },
    "rateLabel": "Mensajes por minuto",
    "startButton": "Iniciar Envíos ({{count}})",
    "stopButton": "Detener Envíos",
    "saveButton": "Guardar Seleccionados ({{count}})",
    "sendingStatus": {
      "sending": "Enviando {{current}} de {{total}}...",
      "finished": "¡Finalizado! Mensajes enviados a {{count}} contactos.",
      "stopped": "Envío detenido por el usuario."
    }
  }
};

// FIX: Added the missing 'pt' constant with Portuguese translations to fix the reference error.
const pt = {
  "app": {
    "title": {
      "full": "Business Hub Pro",
      "short": "Business Hub"
    }
  },
  "sidebar": {
    "dashboard": "Painel",
    "customers": "Clientes",
    "suppliers": "Fornecedores",
    "agenda": "Agenda",
    "reports": "Relatórios",
    "whatsapp": "Envios por WhatsApp",
    "settings": "Configurações",
    "help": "Ajuda"
  },
  "header": {
    "searchPlaceholder": "Pesquisar...",
    "changeToDarkMode": "Mudar para modo escuro",
    "changeToLightMode": "Mudar para modo claro",
    "appointmentsForToday": "Compromissos para Hoje",
    "noAppointmentsToday": "Nenhum compromisso para hoje.",
    "logout": "Sair",
    "searchResults": {
      "customers": "Clientes",
      "suppliers": "Fornecedores",
      "appointments": "Compromissos",
      "noResults": "Nenhum resultado encontrado."
    },
    "trialBanner": "Você tem {{days}} dias restantes no seu período de teste.",
    "pastDueBanner": "Sua conta está com pagamento atrasado. Por favor, atualize suas informações de pagamento.",
    "trialExpiredBanner": "Seu período de teste expirou."
  },
  "login": {
    "welcome": "Bem-vindo de volta! Acesse sua conta.",
    "emailLabel": "E-mail",
    "emailPlaceholder": "seu@email.com",
    "passwordLabel": "Senha",
    "passwordPlaceholder": "••••••",
    "rememberMe": "Lembrar-me",
    "forgotPassword": "Esqueceu sua senha?",
    "firstTimeOrForgot": "Primeiro acesso? / Esqueceu a senha?",
    "signIn": "Entrar",
    "signingIn": "Entrando...",
    "continueWith": "Ou continue com",
    "errors": {
      "invalidCredentials": "E-mail ou senha inválidos.",
      "pendingAccount": "Sua conta está pendente de configuração. Por favor, use o link 'Esqueceu a senha?' para definir sua senha."
    }
  },
  "resetPassword": {
    "title": "Definir/Redefinir Senha",
    "instructions": "Digite seu endereço de e-mail. Enviaremos um link para redefinir sua senha.",
    "continue": "Continuar",
    "sendLink": "Enviar Link de Redefinição",
    "emailNotFound": "Nenhuma conta encontrada com esse e-mail.",
    "setNewPasswordTitle": "Defina uma Nova Senha",
    "password": "Nova Senha",
    "confirmPassword": "Confirmar Nova Senha",
    "passwordMismatch": "As senhas não coincidem.",
    "passwordTooShort": "A senha deve ter pelo menos 6 caracteres.",
    "savePassword": "Salvar Senha",
    "success": "Senha atualizada com sucesso! Agora você pode fazer login.",
    "successLinkSent": "Se existir uma conta para este e-mail, um link de redefinição de senha foi enviado.",
    "backToLogin": "Voltar para o Login"
  },
  "dashboard": {
    "title": "Painel",
    "cards": {
      "activeCustomers": "Clientes Ativos",
      "totalSuppliers": "Total de Fornecedores",
      "upcomingAppointments": "Próximos Compromissos"
    },
    "charts": {
      "customerInteractionsTitle": "Interações com Clientes (Últimos 6 meses)",
      "interactions": "Interações"
    },
    "upcomingAppointments": {
      "title": "Próximos 5 Compromissos",
      "none": "Nenhum compromisso futuro."
    },
    "recentActivity": {
      "title": "Atividade Recente",
      "summary": "Um resumo da atividade recente será exibido aqui."
    },
    "calendar": {
      "viewAppointmentsFor": "Ver compromissos para {{date}}",
      "selectYear": "Selecionar ano"
    }
  },
  "customers": {
    "title": "Clientes",
    "searchPlaceholder": "Pesquisar por nome de cliente...",
    "add": "Adicionar Cliente",
    "edit": "Editar Cliente",
    "addNew": "Adicionar Novo Cliente",
    "name": "Nome",
    "contact": "Contato",
    "status": "Status",
    "customerSince": "Cliente Desde",
    "actions": "Ações",
    "filters": {
      "all": "Todos os Status",
      "status": "Status",
      "sort_by": "Ordenar por",
      "sort_options": {
        "date_newest": "Data (Mais Recente)",
        "date_oldest": "Data (Mais Antigo)",
        "name_asc": "Nome (A-Z)",
        "name_desc": "Nome (Z-A)",
        "status": "Status"
      }
    },
    "noCustomersFound": "Nenhum cliente encontrado.",
    "statusActive": "Ativo",
    "statusInactive": "Inativo",
    "typePerson": "Pessoa Física",
    "typeCompany": "Pessoa Jurídica",
    "details": "Detalhes de {{name}}",
    "fetchError": "Falha ao buscar clientes.",
    "confirmDelete": {
      "title": "Confirmar Exclusão",
      "header": "Excluir Cliente",
      "body": "Você tem certeza que deseja excluir <strong>{{name}}</strong>? Esta ação é permanente e não pode ser desfeita."
    },
    "deleteBlocked": {
      "title": "Exclusão Bloqueada",
      "body": "Este cliente não pode ser excluído. Ele está associado a {{count}} compromisso(s). Por favor, remova-o dos compromissos antes de excluir."
    },
    "analysis": {
      "title": "Análise de Interação para {{name}}",
      "button": "Analisar com IA"
    },
    "form": {
      "fullName": "Nome Completo",
      "companyName": "Razão Social",
      "email": "E-mail",
      "type": "Tipo",
      "cnpj": "CNPJ",
      "cpf": "CPF",
      "phone": "Telefone",
      "cep": "CEP",
      "address": "Endereço",
      "status": "Status",
      "province": "Estado",
      "companyLogo": "Logo da Empresa",
      "uploadLogo": "Carregar Logo",
      "logoHint": "Se nenhum logo for carregado, as iniciais da empresa serão usadas.",
      "avatar": "Avatar",
      "changeAvatar": "Alterar Avatar",
      "errors": {
        "invalidCpf": "CPF inválido. Por favor, verifique o número.",
        "invalidCnpj": "CNPJ inválido. Por favor, verifique o número.",
        "invalidDni": "DNI inválido. Por favor, verifique o número.",
        "invalidCuit": "CUIT inválido. Por favor, verifique o número.",
        "cepNotFound": "CEP não encontrado.",
        "cepError": "Erro ao buscar endereço para o CEP.",
        "invalidCpa": "CPA (Código Postal Argentino) inválido."
      }
    },
    "detailsView": {
      "tabs": {
        "details": "Detalhes",
        "interactions": "Interações",
        "documents": "Documentos"
      },
      "addInteraction": {
        "title": "Registrar Nova Interação",
        "placeholder": "Descreva a interação aqui...",
        "typeLabel": "Tipo:",
        "types": {
          "call": "Ligação",
          "email": "E-mail",
          "meeting": "Reunião",
          "note": "Nota"
        }
      },
      "noInteractions": "Nenhuma interação registrada.",
      "documents": {
        "title": "Documentos do Cliente",
        "upload": "Carregar Documento",
        "noDocuments": "Nenhum documento carregado.",
        "confirmDelete": {
          "title": "Confirmar Exclusão de Documento",
          "body": "Tem certeza que deseja excluir o documento <strong>{{name}}</strong>?"
        }
      }
    }
  },
  "suppliers": {
    "title": "Fornecedores",
    "searchPlaceholder": "Pesquisar por nome da empresa ou contato...",
    "add": "Adicionar Fornecedor",
    "edit": "Editar Fornecedor",
    "addNew": "Adicionar Novo Fornecedor",
    "companyName": "Razão Social",
    "contact": "Contato",
    "services": "Serviços",
    "actions": "Ações",
    "noSuppliersFound": "Nenhum fornecedor encontrado.",
    "viewDetails": "Ver Detalhes",
    "detailsOf": "Detalhes de {{name}}",
    "confirmDelete": {
      "title": "Confirmar Exclusão",
      "header": "Excluir Fornecedor",
      "body": "Você tem certeza que deseja excluir <strong>{{name}}</strong>? Esta ação é permanente e não pode ser desfeita."
    },
    "deleteBlocked": {
      "title": "Exclusão Bloqueada",
      "body": "Este fornecedor não pode ser excluído. Ele está associado a {{count}} compromisso(s). Por favor, remova a associação antes de excluir."
    },
    "form": {
      "companyData": "Dados da Empresa",
      "companyLogo": "Logo da Empresa",
      "uploadLogo": "Carregar Logo",
      "logoHint": "Se nenhum logo for carregado, as iniciais serão usadas.",
      "companyName": "Razão Social",
      "cnpj": "CNPJ",
      "cuit": "CUIT",
      "cep": "CEP",
      "address": "Endereço",
      "province": "Estado",
      "contactInfo": "Informações de Contato",
      "contactPerson": "Pessoa de Contato",
      "contactAvatar": "Avatar do Contato",
      "changeAvatar": "Alterar Avatar",
      "fullName": "Nome Completo",
      "email": "E-mail",
      "phone": "Telefone",
      "services": "Serviços (separados por vírgula)",
      "errors": {
        "invalidCnpj": "CNPJ inválido. Por favor, verifique o número.",
        "invalidCuit": "CUIT inválido. Por favor, verifique o número.",
        "cnpjNotFound": "CNPJ não encontrado.",
        "cnpjError": "Erro ao buscar dados do CNPJ.",
        "cepNotFound": "CEP não encontrado.",
        "cepError": "Erro ao buscar endereço para o CEP.",
        "invalidCpa": "CPA (Código Postal Argentino) inválido."
      }
    }
  },
  "agenda": {
    "title": "Agenda",
    "add": "Novo Compromisso",
    "edit": "Editar Compromisso",
    "viewCompleted": "Ver Concluídos",
    "allAppointments": "Todos os Compromissos",
    "more": "mais",
    "noAppointmentsInCategory": "Nenhum compromisso nesta categoria.",
    "views": {
      "board": "Quadro",
      "list": "Lista",
      "month": "Mês",
      "week": "Semana",
      "day": "Dia"
    },
    "searchPlaceholder": "Pesquisar por título...",
    "filter": {
      "allCustomers": "Todos os Clientes",
      "allSuppliers": "Todos os Fornecedores"
    },
    "board": {
      "overdue": "Pendentes (Atrasados)",
      "today": "Hoje",
      "tomorrow": "Amanhã",
      "next7Days": "Próximos 7 Dias",
      "future": "Futuro",
      "completed": "Concluídos",
      "viewAll": "Ver Todos ({{count}})"
    },
    "noScheduledAppointments": "Nenhum compromisso agendado encontrado para os filtros selecionados.",
    "details": {
      "title": "Detalhes",
      "history": "Histórico",
      "noDescription": "Nenhuma descrição fornecida.",
      "dateTime": "Data e Hora:",
      "location": "Local:",
      "notSpecified": "Não especificado",
      "dueDate": "Data de Vencimento:",
      "participants": "Participantes:",
      "attachments": "Anexos:",
      "reopen": "Reabrir",
      "aiSummary": "Resumo IA",
      "edit": "Editar",
      "modifiedBy": "Modificado por",
      "previousData": "Dados anteriores",
      "subtasks": "Subtarefas",
      "subtaskProgress": "Progresso das Subtarefas",
      "deleteSubtask": "Excluir subtarefa",
      "confirmDeleteSubtask": {
        "title": "Excluir Subtarefa",
        "body": "Tem certeza que deseja excluir a subtarefa '<strong>{{name}}</strong>'? Esta ação não pode ser desfeita."
      },
      "addSubtaskPlaceholder": "Adicionar nova subtarefa..."
    },
    "form": {
      "generalInfo": "Informações Gerais",
      "title": "Título",
      "description": "Descrição",
      "dateAndTime": "Data e Hora",
      "start": "Início",
      "end": "Fim",
      "dueDate": "Data de Vencimento (Opcional)",
      "repeat": "Repetir compromisso",
      "frequency": "Frequência",
      "repeatUntil": "Repetir até",
      "frequencies": {
        "daily": "Diariamente",
        "weekly": "Semanalmente",
        "monthly": "Mensalmente",
        "yearly": "Anualmente"
      },
      "detailsAndAssociations": "Detalhes e Associações",
      "location": "Local",
      "category": "Categoria",
      "reminder": "Lembrete",
      "reminders": {
        "none": "Nenhum",
        "5": "5 minutos antes",
        "15": "15 minutos antes",
        "30": "30 minutos antes",
        "60": "1 hora antes",
        "1440": "1 dia antes"
      },
      "relatedCustomer": "Cliente Relacionado",
      "noCustomer": "Nenhum",
      "relatedSupplier": "Fornecedor Relacionado",
      "noSupplier": "Nenhum",
      "participantsAndAttachments": "Participantes e Anexos",
      "teamParticipants": "Participantes da Equipe",
      "searchTeam": "Buscar na equipe...",
      "attachments": "Anexos",
      "addFiles": "Adicionar Arquivos",
      "notify": "Notificar participantes por e-mail",
      "noParticipants": "Nenhum participante adicionado.",
      "addParticipant": "Adicionar Participante",
      "noUsersFound": "Nenhum usuário encontrado.",
      "errors": {
        "general": "Por favor, preencha o título, data de início e data de fim.",
        "invalidDate": "A data/hora de início ou fim é inválida.",
        "endBeforeStart": "A data de fim deve ser posterior à data de início.",
        "dueAfterStart": "A data de vencimento deve ser posterior à data de início.",
        "recurrenceEnd": "Por favor, defina uma data final para a recorrência."
      }
    },
    "completed": {
      "title": "Histórico de Compromissos Concluídos",
      "searchPlaceholder": "Pesquisar por título...",
      "completedOn": "Concluído em: {{date}}",
      "noCompleted": "Nenhum compromisso concluído encontrado."
    },
    "summary": {
      "title": "Resumo de {{title}}",
      "error": "Falha ao gerar o resumo. Ocorreu um erro com o serviço de IA."
    }
  },
  "reports": {
    "title": "Relatórios e Exportações",
    "exportPDF": "Exportar PDF",
    "exportExcel": "Exportar Excel",
    "startDate": "Data de Início",
    "endDate": "Data de Fim",
    "tabs": {
      "appointments": "Compromissos",
      "customers": "Clientes",
      "suppliers": "Fornecedores",
      "activity": "Registro de Atividade"
    },
    "appointments": {
      "title": "Relatório de Compromissos",
      "fileName": "Relatorio_Compromissos",
      "table": {
        "title": "Título",
        "dateTime": "Data e Hora",
        "dueDate": "Vencimento",
        "location": "Local",
        "participants": "Participantes"
      }
    },
    "customers": {
      "title": "Relatório de Clientes",
      "fileName": "Relatorio_Clientes",
      "statusChartTitle": "Status dos Clientes",
      "listTitle": "Lista de Clientes",
      "table": {
        "name": "Nome",
        "status": "Status",
        "email": "E-mail",
        "phone": "Telefone",
        "type": "Tipo"
      }
    },
    "suppliers": {
      "title": "Relatório de Fornecedores por Categoria",
      "fileName": "Relatorio_Fornecedores",
      "table": {
        "category": "Categoria",
        "supplier": "Fornecedor",
        "contact": "Contato",
        "email": "E-mail",
        "cnpj": "CNPJ"
      }
    },
    "activity": {
      "title": "Registro de Atividade",
      "fileName": "Registro_de_Atividade",
      "type": "Tipo de Atividade",
      "allTypes": "Todos os Tipos",
      "table": {
        "date": "Data",
        "type": "Tipo",
        "description": "Descrição"
      }
    }
  },
  "settings": {
    "title": "Configurações",
    "tabs": {
      "myCompany": "Minha Empresa",
      "users": "Usuários",
      "categories": "Categorias",
      "companies": "Empresas",
      "plans": "Planos",
      "permissions": "Permissões",
      "systemCustomization": "Personalização",
      "integrations": "Integrações"
    },
    "integrations": {
      "title": "Integrações",
      "description": "Configure integrações com serviços de terceiros aqui.",
      "whatsApp": {
        "phoneId": "ID do Número de Telefone do WhatsApp",
        "token": "Token de Acesso do WhatsApp"
      },
      "savedSuccess": "Configurações de integração salvas com sucesso!"
    },
    "customization": {
      "title": "Personalização do Sistema",
      "logoTitle": "Logo do Sistema (Tela de Login)",
      "logoDescription": "Este logo aparecerá na tela de login para todos os usuários.",
      "changeLogo": "Alterar Logo",
      "removeLogo": "Remover Logo",
      "noLogo": "Nenhum logo definido"
    },
    "company": {
      "title": "Informações da Empresa",
      "editTitle": "Editar Informações da Empresa",
      "editButton": "Editar",
      "logo": "Logo da Empresa",
      "name": "Razão Social",
      "cnpj": "CNPJ",
      "address": "Endereço",
      "contactEmail": "E-mail de Contato",
      "phone": "Telefone",
      "changeLogo": "Alterar Logo",
      "errors": {
        "invalidFormat": "Formato de arquivo inválido. Use JPG, PNG ou SVG.",
        "fileTooLarge": "Arquivo muito grande. O limite é de {{limit}}MB.",
        "uploadFailed": "Ocorreu um erro ao ler o arquivo."
      }
    },
    "users": {
      "title": "Gestão de Usuários",
      "add": "Adicionar Usuário",
      "edit": "Editar Usuário",
      "addNew": "Adicionar Novo Usuário",
      "sendPasswordReset": "Enviar redefinição de senha",
      "table": {
        "name": "Nome",
        "role": "Função",
        "company": "Empresa",
        "actions": "Ações"
      },
      "form": {
        "fullName": "Nome Completo",
        "email": "E-mail",
        "role": "Função",
        "company": "Empresa",
        "selectCompany": "Selecione uma empresa",
        "avatar": "Alterar Avatar",
        "roles": {
          "admin": "Administrador",
          "manager": "Gerente",
          "collaborator": "Colaborador"
        },
        "errors": {
          "selectCompany": "Por favor, selecione uma empresa para o novo usuário."
        }
      }
    },
    "companies": {
      "title": "Gestão de Empresas",
      "searchPlaceholder": "Pesquisar por nome ou CNPJ...",
      "add": "Adicionar Empresa",
      "edit": "Editar Empresa",
      "detailsTab": "Detalhes",
      "historyTab": "Histórico",
      "reasonForChange": "Motivo da Alteração (Obrigatório)",
      "noHistory": "Nenhuma alteração de status foi registrada para esta empresa.",
      "historyTable": {
        "date": "Data",
        "changedBy": "Alterado Por",
        "newStatus": "Alteração",
        "reason": "Motivo"
      },
      "history": {
        "changedStatus": "alterou o status de <strong>{{old}}</strong> para <strong>{{new}}</strong>."
      },
      "table": {
        "name": "Razão Social",
        "cnpj": "CNPJ",
        "actions": "Ações",
        "status": "Status",
        "trialEnds": "Fim do Teste"
      },
      "enableTrial": "Habilitar período de teste?",
      "trialDuration": "Duração do Teste (dias)",
      "adminInfo": "Informações do Administrador",
      "deleteWarning": "A empresa principal 'Business Hub Pro Inc.' não pode ser removida por segurança.",
      "confirmDeleteTitle": "Confirmar Exclusão da Empresa",
      "confirmDelete": "Tem certeza de que deseja excluir a empresa \"{{name}}\"? Todos os dados associados (usuários, clientes, etc.) serão removidos permanentemente."
    },
    "plans": {
      "title": "Gestão de Planos",
      "add": "Adicionar Plano",
      "edit": "Editar Plano",
      "addNew": "Adicionar Novo Plano",
      "currentPlan": "Plano Atual",
      "perMonth": "/mês",
      "userLimit": "{{count}} Usuários",
      "customerLimit": "{{count}} Clientes",
      "noPlansTitle": "Nenhum plano criado ainda",
      "noPlansDescription": "Comece criando seu primeiro plano de assinatura.",
      "createFirstPlan": "Criar Primeiro Plano",
      "form": {
        "name": "Nome do Plano",
        "price": "Preço (mensal)",
        "userLimit": "Limite de Usuários",
        "customerLimit": "Limite de Clientes",
        "hasWhatsApp": "Habilitar Módulo WhatsApp",
        "hasAI": "Habilitar Recursos de IA",
        "allowBranding": "Permitir Personalização de Marca"
      },
      "features": {
        "whatsApp": "Módulo WhatsApp",
        "ai": "Recursos de IA",
        "branding": "Personalização de Marca (Logo)"
      },
      "confirmDeleteTitle": "Confirmar Exclusão do Plano",
      "confirmDeleteBody": "Tem certeza de que deseja excluir o plano '{{name}}'?",
      "deleteBlockedTitle": "Exclusão Bloqueada",
      "deleteBlockedBody": "Este plano não pode ser excluído. Ele está em uso pelas seguintes empresas: {{companies}}."
    },
    "categories": {
      "title": "Categorias de Compromisso",
      "save": "Salvar Alterações",
      "new": "Nova Categoria",
      "deleteWarning": "Deve haver pelo menos uma categoria.",
      "confirmDelete": "Tem certeza que deseja remover a categoria \"{{name}}\"?.",
      "errors": {
        "emptyName": "O nome da categoria não pode estar vazio.",
        "duplicateName": "O nome da categoria \"{{name}}\" está duplicado."
      },
      "tooltips": {
        "cannotEditName": "Nomes de categorias padrão não podem ser alterados, pois são usados para traduções do sistema.",
        "cannotDelete": "Categorias padrão não podem ser excluídas."
      }
    },
    "permissions": {
      "title": "Permissões Detalhadas de Usuário",
      "selectUser": "Selecione um Usuário",
      "editingFor": "Editando permissões para: {{name}}",
      "selectUserPrompt": "Selecione um usuário para visualizar e editar suas permissões.",
      "save": "Salvar Permissões",
      "groups": {
        "dashboard": "Painel",
        "customers": "Clientes",
        "suppliers": "Fornecedores",
        "agenda": "Agenda",
        "reports": "Relatórios",
        "settings": "Configurações",
        "superAdmin": "Administração Geral"
      },
      "descriptions": {
        "VIEW_DASHBOARD": "Visualizar painel",
        "VIEW_CUSTOMERS": "Visualizar clientes",
        "MANAGE_CUSTOMERS": "Adicionar/Editar clientes",
        "DELETE_CUSTOMERS": "Excluir clientes",
        "VIEW_SUPPLIERS": "Visualizar fornecedores",
        "MANAGE_SUPPLIERS": "Adicionar/Editar fornecedores",
        "DELETE_SUPPLIERS": "Excluir fornecedores",
        "VIEW_AGENDA": "Visualizar agenda",
        "MANAGE_AGENDA": "Gerenciar agenda (criar/editar eventos)",
        "VIEW_REPORTS": "Visualizar relatórios",
        "VIEW_SETTINGS": "Acessar configurações",
        "MANAGE_COMPANY_INFO": "Editar informações da própria empresa",
        "MANAGE_USERS": "Gerenciar usuários da própria empresa",
        "MANAGE_CATEGORIES": "Gerenciar categorias de compromissos",
        "MANAGE_ALL_USERS": "Gerenciar usuários de QUALQUER empresa",
        "MANAGE_PLANS": "Gerenciar planos de assinatura"
      }
    }
  },
  "help": {
    "title": "Central de Ajuda",
    "intro": "Bem-vindo! Aqui você encontrará guias sobre como usar as funcionalidades do Business Hub.",
    "downloadManual": "Baixar Manual em PDF",
    "manualFilename": "Manual_BusinessHubPro.pdf",
    "sections": {
      "dashboard": {
        "title": "Painel Principal",
        "content": "<p>O Painel é a sua tela inicial, projetada para fornecer uma visão geral rápida das informações mais importantes do seu negócio.</p><h4>Componentes Principais:</h4><ul><li><strong>Cartões de Estatísticas:</strong> No topo, você vê números-chave como o total de clientes ativos, fornecedores e seus próximos compromissos. Estes cartões servem como um termômetro diário da sua operação.</li><li><strong>Gráfico de Novos Clientes:</strong> Este gráfico mostra o crescimento da sua base de clientes nos últimos meses, permitindo identificar tendências de aquisição.</li><li><strong>Lista de Próximos Compromissos:</strong> Um resumo rápido dos seus próximos eventos agendados para o dia, garantindo que você nunca perca um compromisso importante.</li></ul>"
      },
      "customers": {
        "title": "Gerenciando Clientes",
        "content": "<h4>Visualizando a Lista de Clientes</h4><p>Nesta tela, você verá uma tabela com todos os seus clientes. Use a barra de busca no topo para encontrar um cliente específico pelo nome.</p><h4>Adicionando um Novo Cliente</h4><ol><li>Clique no botão azul <strong>\\\"+ Adicionar Cliente\\\"</strong> no canto superior direito.</li><li>Preencha o formulário. O sistema valida automaticamente o CPF/CNPJ para garantir a integridade dos dados.</li><li>Para clientes pessoa física, você pode escolher um avatar pré-definido ou carregar uma foto.</li><li>Após preencher, clique em \\\"Adicionar Cliente\\\" para salvar.</li></ol><h4>Visualizando Detalhes e Interações</h4><ul><li>Clique em qualquer cliente da lista para abrir uma janela com seus detalhes completos.</li><li>Navegue para a aba \\\"Interações\\\" para ver todo o histórico de contatos, como ligações, e-mails e reuniões.</li><li>Você pode registrar uma nova interação diretamente nesta aba.</li></ul><h4>Análise com IA</h4><p>Na aba de interações, caso haja um histórico de contatos, você pode usar o botão <strong>\\\"Analisar com IA\\\"</strong>. A inteligência artificial lerá as interações e gerará um resumo estratégico, identificando o sentimento do cliente, oportunidades de negócio e sugerindo próximos passos.</p>"
      },
      "suppliers": {
        "title": "Gerenciando Fornecedores",
        "content": "<p>A gestão de fornecedores é centralizada nesta tela, funcionando de forma muito similar à de clientes. Você pode cadastrar parceiros, informações de contato e os serviços que eles prestam.</p><ul><li>Use o botão <strong>\\\"+ Adicionar Fornecedor\\\"</strong> para cadastrar um novo parceiro.</li><li>Preencha os dados da empresa, bem como as informações da pessoa de contato principal.</li><li>É possível visualizar, editar ou remover um fornecedor usando os ícones na lista.</li></ul>"
      },
      "agenda": {
        "title": "Utilizando a Agenda",
        "content": "<h4>Visualizações da Agenda</h4><p>A agenda oferece múltiplas formas de ver seus compromissos. Use os botões no canto superior direito para alternar entre as visualizações:</p><ul><li><strong>Quadro (Kanban):</strong> Ideal para o planejamento semanal. Organize compromissos em colunas como \\\"Hoje\\\", \\\"Amanhã\\\", e \\\"Próximos 7 Dias\\\". Arraste e solte cartões para reagendar compromissos de forma intuitiva.</li><li><strong>Lista:</strong> Uma visão cronológica de todos os seus compromissos futuros.</li><li><strong>Mês, Semana, Dia:</strong> Vistas de calendário clássicas para planejamento a curto e longo prazo.</li></ul><h4>Criando e Gerenciando Compromissos</h4><ol><li>Clique no botão <strong>\\\"+ Novo Compromisso\\\"</strong>.</li><li>Preencha os detalhes como título, descrição, data/hora de início e fim.</li><li>Associe compromissos a clientes ou fornecedores para manter um histórico integrado.</li><li>Anexe arquivos importantes e configure recorrências para eventos regulares (diário, semanal, etc.).</li><li>Marque um compromisso como concluído diretamente no quadro ou na lista.</li><li><strong>Adicione subtarefas</strong> para detalhar atividades. Marque-as como concluídas e acompanhe o progresso através de indicadores visuais no quadro e uma barra de progresso na visualização de detalhes.</li></ol><h4>Histórico e Resumo com IA</h4><p>Acesse o \\\"Histórico\\\" para ver todos os compromissos já concluídos. Para qualquer compromisso no histórico, clique em <strong>\\\"Resumo IA\\\"</strong>. O sistema irá gerar um resumo profissional da reunião, ideal para atas e follow-ups.</p>"
      },
      "reports": {
        "title": "Relatórios e Exportações",
        "content": "<p>Esta seção permite visualizar dados consolidados e exportá-los para uso em outras ferramentas ou para apresentações.</p><ul><li><strong>Navegue pelas Abas:</strong> Escolha entre relatórios de Compromissos, Clientes, Fornecedores ou Registro de Atividade.</li><li><strong>Filtre os Dados:</strong> Em cada relatório, você pode usar filtros, como intervalos de datas, para focar nos dados que mais importam.</li><li><strong>Exporte em PDF ou Excel:</strong> Para cada relatório, você encontrará botões para \\\"Exportar PDF\\\" (ótimo para impressão e compartilhamento) e \\\"Exportar Excel\\\" (ideal se precisar manipular os dados em planilhas).</li></ul>"
      },
      "settings": {
        "title": "Configurações",
        "content": "<p>Personalize o sistema para atender às necessidades da sua equipe e empresa.</p><ul><li><strong>Minha Empresa:</strong> Atualize os dados cadastrais da sua empresa, como endereço, telefone e CNPJ.</li><li><strong>Usuários:</strong> Adicione novos membros da sua equipe ao sistema, edite suas informações e defina suas permissões (Administrador, Gerente, Colaborador).</li><li><strong>Categorias:</strong> Personalize as categorias de compromissos. Você pode renomear, alterar ícones e cores para se adequarem melhor à sua organização.</li><li><strong>Empresas (Super Admin):</strong> Se você for um superadministrador, verá uma aba adicional para gerenciar todas as empresas cadastradas no sistema.</li></ul>"
      },
      "faq": {
        "title": "Perguntas Frequentes (FAQ)",
        "q1": "O que faço se esquecer minha senha?",
        "a1": "Atualmente, a recuperação de senha ainda não está automatizada. Por favor, entre em contato com o administrador do sistema em sua empresa para solicitar uma nova senha temporária.",
        "q2": "Posso usar o sistema no meu celular ou tablet?",
        "a2": "Sim! O \\\"Business Hub Pro\\\" foi projetado para ser responsivo, o que significa que se adapta a diferentes tamanhos de tela. A experiência pode ser um pouco diferente, mas todas as funcionalidades principais estarão disponíveis.",
        "q3": "Como funciona a busca na barra superior?",
        "a3": "A barra de busca no topo da tela é uma ferramenta poderosa. Comece a digitar o nome de um cliente, fornecedor ou o título de um compromisso, e os resultados aparecerão automaticamente. Clicar em um resultado o levará diretamente para a página correspondente.",
        "q4": "O que o sino de notificação mostra?",
        "a4": "O ícone do sino mostra um número que representa quantos compromissos você tem agendados para o resto do dia de hoje. Clicar nele abre uma lista rápida desses compromissos."
      }
    }
  },
  "common": {
    "save": "Salvar",
    "saving": "Salvando...",
    "cancel": "Cancelar",
    "saveChanges": "Salvar Alterações",
    "add": "Adicionar",
    "edit": "Editar",
    "delete": "Excluir",
    "close": "Fechar",
    "ok": "OK",
    "actions": "Ações",
    "today": "Hoje",
    "unknownUser": "Usuário Desconhecido",
    "uploadedOn": "Carregado em {{date}}",
    "confirmDiscard": "Você tem alterações не salvas. Tem certeza que deseja descartá-las?",
    "time": {
        "minute": "{{count}} minuto",
        "minutes": "{{count}} minutos",
        "hour": "{{count}} hora",
        "hours": "{{count}} horas",
        "day": "{{count}} dia",
        "days": "{{count}} dias"
    }
  },
  "notifications": {
    "companyUpdated": "Informações da empresa atualizadas com sucesso!",
    "userUpdated": "Usuário atualizado com sucesso!",
    "userAdded": "Usuário adicionado com sucesso!",
    "userAddedWithReset": "Usuário adicionado! Ele deve usar o link 'Esqueceu a senha?' para definir sua senha.",
    "companyAdded": "Empresa adicionada com sucesso!",
    "companyRemoved": "Empresa removida com sucesso!",
    "categoriesSaved": "Categorias salvas com sucesso!",
    "permissionsSaved": "Permissões salvas com sucesso!",
    "integrationsSaved": "Configurações de integração salvas com sucesso!",
    "planAdded": "Plano adicionado com sucesso!",
    "planUpdated": "Plano atualizado com sucesso!",
    "planRemoved": "Plano removido com sucesso!",
    "planDeleteBlocked": "O plano não pode ser excluído. Ele está em uso pelas seguintes empresas: {{companies}}.",
    "customerUpdated": "Cliente atualizado com sucesso!",
    "customerAdded": "Cliente adicionado com sucesso!",
    "customerRemoved": "Cliente removido com sucesso!",
    "customersAddedBatch": "{{count}} novos clientes foram cadastrados com sucesso.",
    "customersSkippedBatch": "{{count}} contatos foram ignorados pois já existem como clientes.",
    "customerUpdateFailed": "Falha ao atualizar cliente.",
    "customerAddFailed": "Falha ao adicionar cliente.",
    "customerRemoveFailed": "Falha ao remover cliente.",
    "supplierUpdated": "Fornecedor atualizado com sucesso!",
    "supplierAdded": "Fornecedor adicionado com sucesso!",
    "supplierRemoved": "Fornecedor removido com sucesso!",
    "appointmentUpdated": "Compromisso atualizado com sucesso!",
    "appointmentAdded": "Compromisso agendado com sucesso!",
    "notificationsSent": "Notificações de atualização enviadas por e-mail.",
    "appointmentReopened": "Compromisso reaberto com sucesso!",
    "systemLogoUpdated": "Logo do sistema atualizado com sucesso!",
    "systemLogoRemoved": "Logo do sistema removido.",
    "documentAdded": "Documento \"{{name}}\" adicionado com sucesso!",
    "documentRemoved": "Documento removido com sucesso!",
    "companyDataFetched": "Dados da empresa preenchidos automaticamente!",
    "ui": {
      "reminder": "Lembrete: \"{{title}}\" começa em aprox. {{time}}."
    },
    "email": {
      "reminder": {
        "subject": "Lembrete de Compromisso: {{title}}",
        "greeting": "Olá {{name}},",
        "body": "Este é um lembrete para o seu próximo compromisso:",
        "titleLabel": "Título",
        "whenLabel": "Quando",
        "whereLabel": "Local",
        "descriptionLabel": "Descrição",
        "preparation": "Por favor, esteja preparado.",
        "sincerely": "Atenciosamente,"
      },
      "update": {
        "subjectNew": "Novo Compromisso: {{title}}",
        "subjectUpdate": "Compromisso Atualizado: {{title}}",
        "greeting": "Olá {{name}},",
        "bodyNew": "Você foi convidado para um novo compromisso:",
        "bodyUpdate": "Um compromisso do qual você faz parte foi atualizado. Aqui estão os detalhes mais recentes:"
      },
      "companyStatusUpdate": {
        "subject": "Atualização de Status da Empresa: {{companyName}}",
        "greeting": "Olá equipe da {{companyName}},",
        "body": "O status da conta da sua empresa foi atualizado:",
        "oldStatus": "Status Anterior",
        "newStatus": "Novo Status",
        "reason": "Motivo"
      }
    }
  },
  "appointment": {
    "category": {
      "CLIENT_MEETING": "Reunião com Cliente",
      "INTERNAL_TEAM": "Equipe Interna",
      "SUPPLIER": "Fornecedor",
      "SALES": "Vendas",
      "PERSONAL": "Pessoal",
      "OTHER": "Outro"
    },
    "status": {
      "agendado": "Agendado",
      "concluido": "Concluído"
    }
  },
  "activityLog": {
    "NEW_COMPANY": "Nova empresa \"{{name}}\" foi adicionada.",
    "UPDATE_COMPANY": "{{description}}",
    "DELETE_COMPANY": "A empresa \"{{name}}\" e todos os seus dados foram removidos.",
    "NEW_USER": "Novo usuário \"{{name}}\" foi adicionado.",
    "UPDATE_USER": "{{description}}",
    "UPDATE_USER_PERMISSIONS": "As permissões para o usuário {{name}} foram atualizadas.",
    "NEW_CUSTOMER": "Novo cliente \"{{name}}\" foi adicionado.",
    "UPDATE_CUSTOMER": "Cliente \"{{name}}\" foi atualizado.",
    "DELETE_CUSTOMER": "Cliente \"{{name}}\" foi removido.",
    "NEW_SUPPLIER": "Novo fornecedor \"{{name}}\" foi adicionado.",
    "UPDATE_SUPPLIER": "Fornecedor \"{{name}}\" foi atualizado.",
    "DELETE_SUPPLIER": "Fornecedor \"{{name}}\" foi removido.",
    "NEW_APPOINTMENT_SERIES": "Nova série de compromissos \"{{title}}\" foi agendada.",
    "NEW_APPOINTMENT": "Novo compromisso \"{{title}}\" foi agendado.",
    "UPDATE_APPOINTMENT": "{{description}}",
    "NEW_INTERACTION": "Nova interação do tipo \"{{type}}\" registrada para \"{{name}}\".",
    "NEW_DOCUMENT": "Novo documento \"{{docName}}\" foi adicionado para o cliente \"{{customerName}}\".",
    "DELETE_DOCUMENT": "O documento \"{{docName}}\" foi removido do cliente \"{{customerName}}\"."
  },
  "icons": {
    "CustomerIcon": "Cliente",
    "UsersIcon": "Equipe",
    "SupplierIcon": "Fornecedor",
    "BriefcaseIcon": "Vendas",
    "TagIcon": "Geral",
    "HeartIcon": "Pessoal",
    "AgendaIcon": "Agenda",
    "DashboardIcon": "Painel",
    "ReportsIcon": "Relatórios",
    "SettingsIcon": "Configurações",
    "HelpIcon": "Ajuda",
    "CalendarCheckIcon": "Concluído",
    "KeyIcon": "Chave"
  },
  "avatarSelection": {
    "title": "Escolha ou Carregue um Avatar"
  },
  "iconPicker": {
    "title": "Selecione um Ícone"
  },
  "companyStatus": {
    "active": "Ativo",
    "trial": "Em Teste",
    "suspended": "Suspenso"
  },
  "accountStatus": {
    "suspended": {
      "title": "Conta Suspensa",
      "body": "A conta da sua empresa foi suspensa. Por favor, entre em contato com o suporte."
    },
    "trialExpired": {
      "title": "Período de Teste Expirado",
      "body": "Seu período de teste terminou. Para continuar usando o serviço, por favor, atualize para um plano pago ou entre em contato com seu administrador."
    },
    "past_due": {
      "title": "Pagamento Atrasado",
      "body": "O pagamento da sua assinatura está atrasado. Por favor, entre em contato com seu administrador para regularizar a situação e restaurar o acesso completo."
    },
    "logout": "Sair"
  },
  "whatsapp": {
    "title": "WhatsApp (Cloud API)",
    "step1": "Passo 1: Configuração da API",
    "phoneIdLabel": "ID do Número de Telefone de Origem",
    "tokenLabel": "Token de Acesso",
    "saveConfig": "Salvar Configuração",
    "configSaved": "Configuração salva!",
    "configNotSaved": "Configuração não salva.",
    "configError": "A configuração da API não está salva. Por favor, salve-a primeiro.",
    "step2": "Passo 2: Compor Mensagem",
    "templateLabel": "Selecione um Modelo de Mensagem",
    "templatePlaceholder": "Escolha um modelo...",
    "parametersTitle": "Parâmetros do Modelo",
    "paramInfo": "O valor para {{1}} será substituído automaticamente pelo nome do contato.",
    "step3": "Passo 3: Adicionar Contatos",
    "step4": "Passo 4: Configurar e Enviar",
    "logTitle": "Log de Envio",
    "logEmpty": "Os logs aparecerão aqui quando o envio começar.",
    "logSuccess": "SUCESSO: Mensagem enviada para {{name}} ({{phone}})",
    "logError": "ERRO ao enviar para {{name}} ({{phone}}): {{error}}",
    "configMissing": {
      "title": "Configuração da API Necessária",
      "message": "As credenciais da API do WhatsApp não estão definidas. Por favor, vá para Configurações para adicioná-las antes de prosseguir.",
      "goToSettings": "Ir para Configurações"
    },
    "templates": {
      "manageTitle": "Gerenciar Modelos de Mensagem",
      "createButton": "Criar Novo Modelo",
      "modalTitleCreate": "Criar Novo Modelo de Mensagem",
      "modalTitleEdit": "Editar Modelo de Mensagem",
      "defaultBadge": "Padrão",
      "confirmDelete": "Tem certeza de que deseja excluir o modelo '{{name}}'?",
      "deleteErrorDefault": "Modelos padrão não podem ser excluídos.",
      "form": {
        "nameLabel": "Nome do Modelo (Amigável)",
        "apiNameLabel": "Nome na API (ex: hello_world)",
        "apiNamePlaceholder": "apenas_minusculas_e_sublinhados",
        "apiNameError": "O Nome na API só pode conter letras minúsculas, números e sublinhados.",
        "bodyLabel": "Corpo da Mensagem",
        "bodyHint": "Use {{1}} para o nome do cliente e {{2}}, {{3}}, etc., para outros parâmetros.",
        "paramsLabel": "Parâmetros Detectados"
      },
      "hello_world": {
        "name": "Mensagem de Boas-vindas",
        "body": "Olá {{1}}, bem-vindo ao nosso serviço!"
      },
      "order_update": {
        "name": "Atualização de Pedido",
        "body": "Olá {{1}}, seu pedido nº{{2}} foi enviado. O código de rastreamento é {{3}}."
      },
      "appointment_reminder": {
        "name": "Lembrete de Compromisso",
        "body": "Olá {{1}}, este é um lembrete para seu compromisso amanhã às {{2}}. Até breve!"
      }
    },
    "contactSource": {
      "file": "Importar Arquivo",
      "manual": "Entrada Manual"
    },
    "file": {
      "instructions": "Carregue um arquivo Excel (.xlsx) ou CSV (.csv). Ele deve conter as colunas 'Nome' e 'Telefone'."
    },
    "manual": {
      "nameLabel": "Nome",
      "phoneLabel": "Número de Telefone (com código do país)",
      "addButton": "Adicionar"
    },
    "contactList": {
      "title": "Contatos para Envio",
      "empty": "Nenhum contato adicionado ainda.",
      "nameHeader": "Nome",
      "phoneHeader": "Telefone",
      "sendHeader": "Enviar",
      "saveHeader": "Salvar",
      "selectAllSend": "Selecionar Todos para Envio",
      "selectAllSave": "Selecionar Todos para Salvar",
      "searchPlaceholder": "Filtrar contatos...",
      "summary": {
        "total": "Total",
        "toSend": "Para Enviar",
        "toSave": "Para Salvar"
      }
    },
    "rateLabel": "Mensagens por minuto",
    "startButton": "Iniciar Envios ({{count}})",
    "stopButton": "Parar Envios",
    "saveButton": "Salvar Selecionados ({{count}})",
    "sendingStatus": {
      "sending": "Enviando {{current}} de {{total}}...",
      "finished": "Finalizado! Mensagens enviadas para {{count}} contatos.",
      "stopped": "Envio interrompido pelo usuário."
    }
  }
};

const translations = { en, pt, es };

export type Language = 'en' | 'pt' | 'es';

const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

class I18nManager {
  private currentLanguage: Language;
  private subscribers: Array<() => void> = [];

  constructor() {
    const savedLang = localStorage.getItem('language');
    this.currentLanguage = (savedLang && savedLang in translations) ? (savedLang as Language) : 'pt';
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(sub => sub());
  }

  setLanguage = (lang: Language) => {
    if (lang in translations) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.notify();
    }
  }

  getLanguage = (): Language => {
    return this.currentLanguage;
  }
  
  getLocale = (): string => {
    const localeMap: Record<Language, string> = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-AR' };
    return localeMap[this.currentLanguage] || 'pt-BR';
  }

  t = (key: string, params?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(translations[this.currentLanguage], key)
      ?? getNestedTranslation(translations.pt, key); // Fallback to PT if key not in current lang

    if (translation === undefined) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation!.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return translation;
  }
}

export const i18n = new I18nManager();