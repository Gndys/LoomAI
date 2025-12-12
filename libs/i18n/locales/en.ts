import type { Locale } from './types'

export const en: Locale = {
  common: {
    welcome: "Welcome to LoomAI",
    siteName: "LoomAI",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    settings: "Settings",
    and: "and",
    loading: "Loading...",
    unexpectedError: "An unexpected error occurred",
    notAvailable: "N/A",
    viewPlans: "View Plans",
    yes: "Yes",
    no: "No",
    theme: {
      light: "Light Theme",
      dark: "Dark Theme",
      system: "System Theme",
      toggle: "Toggle Theme",
      appearance: "Appearance",
      colorScheme: "Color Scheme",
      themes: {
        default: "Default",
        claude: "Claude",
        "cosmic-night": "Cosmic Night",
        "modern-minimal": "Modern Minimal",
        "ocean-breeze": "Ocean Breeze"
      }
    }
  },
  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    orders: "Orders",
    shipments: "Shipments",
    tracking: "Tracking",
    admin: {
      dashboard: "Dashboard",
      users: "Users",
      subscriptions: "Subscriptions",
      orders: "Orders",
      application: "Application"
    }
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    tryAgain: "Try again",
    createAccount: "Create account",
    sendCode: "Send Code",
    verify: "Verify",
    backToList: "Back to Users",
    saveChanges: "Save Changes",
    createUser: "Create User",
    deleteUser: "Delete User",
    back: "Back",
    resendCode: "Resend Code",
    resendVerificationEmail: "Resend Verification Email"
  },
  email: {
    verification: {
      subject: "Verify your TinyShip account",
      title: "Verify your email address",
      greeting: "Hello {{name}},",
      message: "Thank you for registering with TinyShip. To complete your registration, please click the button below to verify your email address.",
      button: "Verify Email Address",
      alternativeText: "Or, copy and paste the following link into your browser:",
      expiry: "This link will expire in {{expiry_hours}} hours.",
      disclaimer: "If you didn't request this verification, please ignore this email.",
      signature: "Happy Shipping, The TinyShip Team",
    copyright: "© {{year}} TinyShip. All rights reserved."
    },
    resetPassword: {
      subject: "Reset your TinyShip password",
      title: "Reset your password",
      greeting: "Hello {{name}},",
      message: "We received a request to reset your password. Please click the button below to create a new password. If you didn't make this request, you can safely ignore this email.",
      button: "Reset Password",
      alternativeText: "Or, copy and paste the following link into your browser:",
      expiry: "This link will expire in {{expiry_hours}} hours.",
      disclaimer: "If you didn't request a password reset, no action is required.",
      signature: "Happy Shipping, The TinyShip Team",
      copyright: "© {{year}} TinyShip. All rights reserved."
    }
  },
  auth: {
    metadata: {
      signin: {
        title: "TinyShip - Sign In",
        description: "Sign in to your TinyShip account to access your dashboard, manage subscriptions, and use premium features.",
        keywords: "sign in, login, authentication, account access, dashboard"
      },
      signup: {
        title: "TinyShip - Create Account",
        description: "Create your TinyShip account and start building amazing SaaS applications with our comprehensive starter kit.",
        keywords: "sign up, register, create account, new user, get started"
      },
      forgotPassword: {
        title: "TinyShip - Reset Password",
        description: "Reset your TinyShip account password securely. Enter your email to receive password reset instructions.",
        keywords: "forgot password, reset password, password recovery, account recovery"
      },
      resetPassword: {
        title: "TinyShip - Create New Password",
        description: "Create a new secure password for your TinyShip account. Choose a strong password to protect your account.",
        keywords: "new password, password reset, secure password, account security"
      },
      phone: {
        title: "TinyShip - Phone Login",
        description: "Sign in to TinyShip using your phone number. Quick and secure authentication with SMS verification.",
        keywords: "phone login, SMS verification, mobile authentication, phone number"
      },
      wechat: {
        title: "TinyShip - WeChat Login",
        description: "Sign in to TinyShip using your WeChat account. Convenient authentication for Chinese users.",
        keywords: "WeChat login, 微信登录, social login, Chinese authentication"
      }
    },
    signin: {
      title: "Sign in to your account",
      welcomeBack: "Welcome back",
      socialLogin: "Sign in with your favorite social account",
      continueWith: "Or continue with",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      forgotPassword: "Forgot password?",
      rememberMe: "Remember me",
      submit: "Sign in",
      submitting: "Signing in...",
      noAccount: "Don't have an account?",
      signupLink: "Sign up",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      socialProviders: {
        google: "Google",
        github: "GitHub",
        apple: "Apple",
        wechat: "WeChat",
        phone: "Phone"
      },
      errors: {
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        requiredPassword: "Password is required",
        invalidCredentials: "Invalid email or password",
        captchaRequired: "Please complete the captcha verification",
        emailNotVerified: {
          title: "Email verification required",
          description: "Please check your email and click the verification link. If you haven't received the email, click the button below to resend.",
          resendSuccess: "Verification email has been resent, please check your inbox.",
          resendError: "Failed to resend verification email, please try again later.",
          dialogTitle: "Resend Verification Email",
          dialogDescription: "Please complete the captcha verification before resending the verification email",
          emailLabel: "Email Address",
          sendButton: "Send Verification Email",
          sendingButton: "Sending...",
          waitButton: "Wait {seconds}s"
        }
      }
    },
    signup: {
      title: "Sign up for ShipEasy",
      createAccount: "Create an account",
      socialSignup: "Sign up with your favorite social account",
      continueWith: "Or continue with",
      name: "Name",
      namePlaceholder: "Enter your name",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Create a password",
      imageUrl: "Profile Image URL",
      imageUrlPlaceholder: "https://example.com/your-image.jpg",
      optional: "Optional",
      submit: "Create account",
      submitting: "Creating account...",
      haveAccount: "Already have an account?",
      signinLink: "Sign in",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      verification: {
        title: "Verification Required",
        sent: "We've sent a verification email to",
        checkSpam: "Can't find the email? Please check your spam folder.",
        spamInstruction: "If you still don't see it,"
      },
      errors: {
        invalidName: "Please enter a valid name",
        requiredName: "Name is required",
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        invalidPassword: "Please enter a valid password",
        requiredPassword: "Password is required",
        invalidImage: "Please enter a valid image URL",
        captchaRequired: "Please complete the captcha verification",
        captchaError: "Captcha verification failed, please try again",
        captchaExpired: "Captcha verification expired, please try again"
      }
    },
    phone: {
      title: "Login with Phone",
      description: "Enter your phone number to receive a verification code",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "Enter your phone number",
      countryCode: "Country/Region",
      verificationCode: "Verification Code",
      enterCode: "Enter Verification Code",
      sendingCode: "Sending code...",
      verifying: "Verifying...",
      codeSentTo: "Verification code sent to",
      resendIn: "Resend in",
      seconds: "seconds",
      resendCode: "Resend Code",
      resendCountdown: "seconds remaining",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      errors: {
        invalidPhone: "Please enter a valid phone number",
        requiredPhone: "Phone number is required",
        requiredCountryCode: "Please select country/region",
        invalidCode: "Please enter a valid verification code",
        requiredCode: "Verification code is required",
        captchaRequired: "Please complete the captcha verification"
      }
    },
    forgetPassword: {
      title: "Forgot Password",
      description: "Reset your password and regain access to your account",
      email: "Email",
      emailPlaceholder: "Enter your email",
      submit: "Send reset link",
      submitting: "Sending...",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      verification: {
        title: "Check your email",
        sent: "We've sent a password reset link to",
        checkSpam: "Can't find the email? Please check your spam folder."
      },
      errors: {
        invalidEmail: "Please enter a valid email",
        requiredEmail: "Email is required",
        captchaRequired: "Please complete the captcha verification"
      }
    },
    resetPassword: {
      title: "Reset Password",
      description: "Create a new password for your account",
      password: "New Password",
      passwordPlaceholder: "Enter your new password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your new password",
      submit: "Reset Password",
      submitting: "Resetting...",
      success: {
        title: "Password Reset Successful",
        description: "Your password has been successfully reset.",
        backToSignin: "Back to Sign In",
        goToSignIn: "Back to Sign In"
      },
      errors: {
        invalidPassword: "Password must be at least 8 characters",
        requiredPassword: "Password is required",
        passwordsDontMatch: "Passwords don't match",
        invalidToken: "Invalid or expired reset link. Please try again."
      }
    },
    wechat: {
      title: "WeChat Login",
      description: "Scan with WeChat to log in",
      scanQRCode: "Please scan the QR code with WeChat",
      orUseOtherMethods: "Or use other login methods",
      loadingQRCode: "Loading QR code...",
      termsNotice: "By clicking continue, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      errors: {
        loadingFailed: "Failed to load WeChat QR code",
        networkError: "Network error, please try again"
      }
    },
    // Auth error codes mapping for Better Auth
    authErrors: {
      USER_ALREADY_EXISTS: "User with this email already exists",
      INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
      EMAIL_NOT_VERIFIED: "Please verify your email address",
      USER_NOT_FOUND: "No account found with this email",
      INVALID_CREDENTIALS: "Invalid credentials provided",
      ACCOUNT_BLOCKED: "Your account has been temporarily blocked",
      TOO_MANY_REQUESTS: "Too many login attempts. Please try again later",
      INVALID_TOKEN: "Invalid or expired token",
      SESSION_EXPIRED: "Your session has expired. Please sign in again",
      PHONE_NUMBER_ALREADY_EXISTS: "Phone number is already registered",
      INVALID_PHONE_NUMBER: "Invalid phone number format",
      OTP_EXPIRED: "Verification code has expired",
      INVALID_OTP: "Invalid verification code",
      OTP_TOO_MANY_ATTEMPTS: "Too many verification attempts. Please request a new code",
      CAPTCHA_REQUIRED: "Please complete the captcha verification",
      CAPTCHA_INVALID: "Captcha verification failed",
      EMAIL_SEND_FAILED: "Failed to send email. Please try again later",
      SMS_SEND_FAILED: "Failed to send SMS. Please try again later",
      UNKNOWN_ERROR: "An unexpected error occurred"
    }
  },
  admin: {
    metadata: {
      title: "TinyShip - Admin Dashboard",
      description: "Comprehensive admin dashboard for managing users, subscriptions, orders, and system analytics in your SaaS application.",
      keywords: "admin, dashboard, management, SaaS, analytics, users, subscriptions, orders"
    },
    dashboard: {
      title: "Admin Dashboard",
      accessDenied: "Access Denied",
      noPermission: "You don't have permission to access the admin dashboard",
      lastUpdated: "Last updated",
      metrics: {
        totalRevenue: "Total Revenue",
        totalRevenueDesc: "All time revenue",
        newCustomers: "Monthly New Customers",
        newCustomersDesc: "New customers this month",
        newOrders: "Monthly New Orders",
        newOrdersDesc: "New orders this month",
        fromLastMonth: "from last month"
      },
      chart: {
        monthlyRevenueTrend: "Monthly Revenue Trend",
        revenue: "Revenue",
        orders: "Orders"
      },
      todayData: {
        title: "Today's Data",
        revenue: "Revenue",
        newUsers: "New Users",
        orders: "Orders"
      },
      monthData: {
        title: "This Month's Data",
        revenue: "Monthly Revenue",
        newUsers: "Monthly New Users",
        orders: "Monthly Orders"
      },
      recentOrders: {
        title: "Recent Orders",
        orderId: "Order ID",
        customer: "Customer",
        plan: "Plan",
        amount: "Amount",
        provider: "Payment Method",
        status: "Status",
        time: "Time",
        total: "Total"
      }
    },
    users: {
      title: "User Management",
      subtitle: "Manage users, roles, and permissions",
      actions: {
        addUser: "Add User",
        editUser: "Edit User",
        deleteUser: "Delete User",
        banUser: "Ban User",
        unbanUser: "Unban User"
      },
      table: {
        columns: {
          id: "ID",
          name: "Name",
          email: "Email",
          role: "Role",
          phoneNumber: "Phone Number",
          emailVerified: "Email Verified",
          banned: "Banned",
          createdAt: "Created At",
          updatedAt: "Updated At",
          actions: "Actions"
        },
        actions: {
          editUser: "Edit User",
          deleteUser: "Delete User",
          clickToCopy: "Click to copy"
        },
        sort: {
          ascending: "Sort ascending",
          descending: "Sort descending",
          none: "Remove sorting"
        },
        noResults: "No users found",
        search: {
          searchBy: "Search by",
          searchPlaceholder: "Search {field}...",
          filterByRole: "Filter by role",
          allRoles: "All Roles",
          banStatus: "Ban status",
          allUsers: "All users",
          bannedUsers: "Banned",
          notBannedUsers: "Not banned",
          view: "View",
          toggleColumns: "Toggle columns"
        },
        pagination: {
          showing: "Showing {start} to {end} of {total} results",
          pageInfo: "Page {current} of {total}"
        },
        dialog: {
          banTitle: "Ban User",
          banDescription: "Are you sure you want to ban this user? They will not be able to access the application.",
          banSuccess: "User banned successfully",
          unbanSuccess: "User unbanned successfully",
          updateRoleSuccess: "User role updated successfully",
          updateRoleFailed: "Failed to update user role"
        }
      },
      banDialog: {
        title: "Ban User",
        description: "Are you sure you want to ban {userName}? They will not be able to access the application."
      },
      unbanDialog: {
        title: "Unban User",
        description: "Are you sure you want to unban {userName}? They will regain access to the application."
      },
      form: {
        title: "User Information",
        description: "Enter user details below",
        labels: {
          name: "Name",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          role: "Role",
          image: "Profile Image",
          phoneNumber: "Phone Number",
          emailVerified: "Email Verified",
          phoneVerified: "Phone Verified",
          banned: "Banned",
          banReason: "Ban Reason"
        },
        placeholders: {
          name: "Enter user's name",
          email: "Enter user's email",
          password: "Enter password (min 8 characters)",
          confirmPassword: "Confirm password",
          selectRole: "Select role",
          image: "https://example.com/avatar.jpg",
          phoneNumber: "Enter phone number",
          banReason: "Reason for banning (optional)"
        },
        validation: {
          nameRequired: "Name is required",
          emailRequired: "Email is required",
          emailInvalid: "Please enter a valid email",
          passwordRequired: "Password is required",
          passwordMinLength: "Password must be at least 8 characters",
          passwordMismatch: "Passwords do not match",
          roleRequired: "Role is required"
        }
      },
      deleteDialog: {
        title: "Delete User",
        description: "Are you absolutely sure? This action cannot be undone. This will permanently delete the user account and remove all associated data."
      },
      messages: {
        createSuccess: "User created successfully",
        updateSuccess: "User updated successfully",
        deleteSuccess: "User deleted successfully",
        deleteError: "Failed to delete user",
        fetchError: "Failed to fetch user data",
        operationFailed: "Operation failed"
      }
    },
    orders: {
      title: "Orders",
      actions: {
        createOrder: "Create Order"
      },
      messages: {
        fetchError: "Failed to load orders. Please try again."
      },
      table: {
        noResults: "No orders found.",
        search: {
          searchBy: "Search by...",
          searchPlaceholder: "Search by {field}...",
          filterByStatus: "Filter by status",
          allStatus: "All Status",
          filterByProvider: "Payment provider",
          allProviders: "All Providers",
          stripe: "Stripe",
          wechat: "WeChat",
          creem: "Creem"
        },
        columns: {
          id: "Order ID",
          user: "User",
          amount: "Amount",
          plan: "Plan",
          status: "Status",
          provider: "Provider",
          providerOrderId: "Provider Order ID",
          createdAt: "Created At",
          actions: "Actions"
        },
        actions: {
          openMenu: "Open menu",
          actions: "Actions",
          viewOrder: "View order",
          refundOrder: "Refund order",
          clickToCopy: "Click to copy"
        },
        sort: {
          ascending: "Sort ascending",
          descending: "Sort descending",
          none: "Remove sorting"
        }
      },
      status: {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
        canceled: "Canceled"
      }
    },
    subscriptions: {
      title: "Subscriptions",
      description: "Manage user subscriptions and billing",
      actions: {
        createSubscription: "Create Subscription"
      },
      messages: {
        fetchError: "Failed to load subscriptions. Please try again."
      },
      table: {
        showing: "Showing {from} to {to} of {total} results",
        noResults: "No subscriptions found.",
        rowsPerPage: "Rows per page",
        page: "Page",
        of: "of",
        view: "View",
        toggleColumns: "Toggle columns",
        goToFirstPage: "Go to first page",
        goToPreviousPage: "Go to previous page", 
        goToNextPage: "Go to next page",
        goToLastPage: "Go to last page",
        search: {
          searchLabel: "Search subscriptions",
          searchField: "Search field",
          statusLabel: "Status",
          providerLabel: "Provider",
          search: "Search",
          clear: "Clear",
          allStatuses: "All statuses",
          allProviders: "All providers",
          stripe: "Stripe",
          creem: "Creem",
          wechat: "WeChat",
          userEmail: "User Email",
          subscriptionId: "Subscription ID",
          userId: "User ID",
          planId: "Plan ID",
          stripeSubscriptionId: "Stripe Subscription ID",
          creemSubscriptionId: "Creem Subscription ID",
          placeholders: {
            userEmail: "Enter user email...",
            subscriptionId: "Enter subscription ID...",
            userId: "Enter user ID...",
            planId: "Enter plan ID...",
            stripeSubscriptionId: "Enter Stripe subscription ID...",
            creemSubscriptionId: "Enter Creem subscription ID...",
            default: "Enter search term..."
          },
          searchBy: "Search by...",
          searchPlaceholder: "Search by {field}...",
          filterByStatus: "Filter by status",
          filterByProvider: "Filter by provider",
          allStatus: "All Status",
          filterByPaymentType: "Payment type",
          allPaymentTypes: "All Types",
          active: "Active",
          canceled: "Canceled",
          expired: "Expired",
          trialing: "Trialing",
          inactive: "Inactive",
          oneTime: "One Time",
          recurring: "Recurring"
        },
        columns: {
          id: "Subscription ID",
          user: "Customer",
          plan: "Plan",
          status: "Status",
          paymentType: "Payment Type",
          provider: "Provider",
          periodStart: "Period Start",
          periodEnd: "Period End",
          cancelAtPeriodEnd: "Will Cancel",
          createdAt: "Created",
          updatedAt: "Updated",
          metadata: "Metadata",
          period: "Period",
          actions: "Actions"
        },
        actions: {
          openMenu: "Open menu",
          actions: "Actions",
          viewSubscription: "View subscription",
          cancelSubscription: "Cancel subscription",
          clickToCopy: "Click to copy"
        },
        sort: {
          ascending: "Sort ascending",
          descending: "Sort descending",
          none: "Remove sorting"
        }
      },
      status: {
        active: "Active",
        trialing: "Trialing",
        canceled: "Canceled",
        cancelled: "Canceled",
        expired: "Expired",
        inactive: "Inactive"
      },
      paymentType: {
        one_time: "One-time",
        recurring: "Recurring"
      }
    }
  },
  pricing: {
    metadata: {
      title: "TinyShip - Pricing Plans",
      description: "Pay per image at ¥2 per render, with volume bundles for lower unit pricing. Secure checkout with WeChat Pay and global providers.",
      keywords: "pricing, image credits, pay per use, volume discount, wechat pay, subscription"
    },
    title: "Pricing",
    subtitle: "Pay per image, cheaper in volume",
    description: "Base price is ¥2 per image. Save more with 20-image and 100-image bundles. Pay once, use credits anytime with secure checkout.",
    cta: "Get started",
    recommendedBadge: "Recommended",
    lifetimeBadge: "One-time purchase, lifetime access",
    features: {
      securePayment: {
        title: "Multi-Provider Security",
        description: "Support WeChat Pay, Stripe, Creem with enterprise-grade security"
      },
      flexibleSubscription: {
        title: "Flexible Billing",
        description: "Both one-time payments and recurring subscriptions supported"
      },
      globalCoverage: {
        title: "Global Payment Coverage", 
        description: "Multi-currency and regional payment methods for worldwide access"
      }
    },
    plans: {
      monthly: {
        name: "Monthly Plan",
        description: "Perfect for short-term projects",
        duration: "month",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support"
        }
      },
      yearly: {
        name: "Annual Plan",
        description: "Best value for long-term use",
        duration: "year",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support",
          "两个月免费": "2 months free"
        }
      },
      lifetime: {
        name: "Lifetime",
        description: "One-time payment, lifetime access",
        duration: "lifetime",
        features: {
          "所有高级功能": "All premium features",
          "优先支持": "Priority support",
          "终身免费更新": "Free lifetime updates"
        }
      }
    }
  },
  payment: {
    metadata: {
      success: {
        title: "TinyShip - Payment Successful",
        description: "Your payment has been processed successfully. Thank you for your subscription and welcome to our premium features.",
        keywords: "payment, success, subscription, confirmation, premium"
      },
      cancel: {
        title: "TinyShip - Payment Cancelled",
        description: "Your payment was cancelled. You can retry the payment or contact our support team for assistance.",
        keywords: "payment, cancelled, retry, support, subscription"
      }
    },
    result: {
      success: {
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        actions: {
          viewSubscription: "View Subscription",
          backToHome: "Back to Home"
        }
      },
      cancel: {
        title: "Payment Cancelled",
        description: "Your payment has been cancelled.",
        actions: {
          tryAgain: "Try Again",
          contactSupport: "Contact Support",
          backToHome: "Back to Home"
        }
      },
      failed: "Payment failed, please try again"
    },
    steps: {
      initiate: "Initialize",
      initiateDesc: "Prepare payment",
      scan: "Scan",
      scanDesc: "Scan QR code",
      pay: "Pay",
      payDesc: "Confirm payment"
    },
    scanQrCode: "Please scan the QR code with WeChat to complete the payment",
    confirmCancel: "Your payment is not complete. Are you sure you want to cancel?",
    orderCanceled: "Your order has been canceled"
  },
  subscription: {
    metadata: {
      title: "TinyShip - My Subscription",
      description: "Manage your subscription plan, view billing history, and update payment methods in your subscription dashboard.",
      keywords: "subscription, billing, payment, plan, management, dashboard"
    },
    title: "My Subscription",
    overview: {
      title: "Subscription Overview",
      planType: "Plan Type",
      status: "Status",
      active: "Active",
      startDate: "Start Date",
      endDate: "End Date",
      progress: "Subscription Progress"
    },
    management: {
      title: "Subscription Management",
      description: "Manage your subscription, view billing history, and update payment methods through the customer portal.",
      manageSubscription: "Manage Subscription",
      changePlan: "Change Plan",
      redirecting: "Redirecting..."
    },
    noSubscription: {
      title: "No Active Subscription Found",
      description: "You currently don't have an active subscription plan.",
      viewPlans: "View Plans"
    }
  },
  dashboard: {
    metadata: {
      title: "TinyShip - Dashboard",
      description: "Manage your account, subscriptions, and profile settings in your personalized dashboard.",
      keywords: "dashboard, account, profile, subscription, settings, management"
    },
    title: "Dashboard",
    description: "Manage your account and subscriptions",
    profile: {
      title: "Profile Information",
      noNameSet: "No name set",
      role: "Role:",
      emailVerified: "Email verified",
      editProfile: "Edit Profile",
      updateProfile: "Update Profile",
      cancel: "Cancel",
      form: {
        labels: {
          name: "Full Name",
          email: "Email Address",
          image: "Profile Image URL"
        },
        placeholders: {
          name: "Enter your full name",
          email: "Email address",
          image: "https://example.com/your-image.jpg"
        },
        emailReadonly: "Email address cannot be modified",
        imageDescription: "Optional: Enter a URL for your profile picture"
      },
      updateSuccess: "Profile updated successfully",
      updateError: "Failed to update profile. Please try again."
    },
    subscription: {
      title: "Subscription Status",
      status: {
        lifetime: "Lifetime",
        active: "Active",
        canceled: "Canceled",
        cancelAtPeriodEnd: "Canceling at Period End",
        pastDue: "Past Due",
        unknown: "Unknown",
        noSubscription: "No Subscription"
      },
      paymentType: {
        recurring: "Recurring",
        oneTime: "One-time"
      },
      lifetimeAccess: "You have lifetime access",
      expires: "Expires:",
      cancelingNote: "Your subscription will not renew and will end on:",
      noActiveSubscription: "You currently have no active subscription",
      manageSubscription: "Manage Subscription",
      viewPlans: "View Plans"
    },
    account: {
      title: "Account Details",
      memberSince: "Member since",
      phoneNumber: "Phone Number"
    },
    orders: {
      title: "Order History",
      status: {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
        canceled: "Canceled"
      },
      provider: {
        stripe: "Stripe",
        wechat: "WeChat Pay",
        creem: "Creem"
      },
      noOrders: "No orders found",
      noOrdersDescription: "You haven't placed any orders yet",
      viewAllOrders: "View All Orders",
      orderDetails: {
        orderId: "Order ID",
        amount: "Amount",
        plan: "Plan",
        status: "Status",
        provider: "Payment Method",
        createdAt: "Created"
      },
      recent: {
        title: "Recent Orders",
        showingRecent: "Showing {count} most recent orders"
      },
      page: {
        title: "All Orders",
        description: "View and manage all your orders",
        backToDashboard: "Back to Dashboard",
        totalOrders: "Total {count} orders"
      }
    },
    linkedAccounts: {
      title: "Linked Accounts",
      connected: "Connected",
      connectedAt: "Connected:",
      noLinkedAccounts: "No linked accounts",
      providers: {
        credentials: "Email & Password",
        google: "Google",
        github: "GitHub",
        facebook: "Facebook",
        apple: "Apple",
        discord: "Discord",
        wechat: "WeChat",
        phone: "Phone Number"
      }
    },
    tabs: {
      profile: {
        title: "Profile",
        description: "Manage your personal information and avatar"
      },
      account: {
        title: "Account Management",
        description: "Password changes, linked accounts and security"
      },
      security: {
        title: "Security",
        description: "Password and security settings"
      },
      subscription: {
        description: "Manage your subscription plan and features"
      },
      orders: {
        description: "View your order history and transactions"
      },
      content: {
        profile: {
          title: "Profile",
          subtitle: "This is how others will see you on the site.",
          username: {
            label: "Username",
            value: "shadcn",
            description: "This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days."
          },
          email: {
            label: "Email",
            placeholder: "Select a verified email to display",
            description: "You can manage verified email addresses in your email settings."
          }
        },
        account: {
          title: "Account Settings",
          subtitle: "Manage your account settings and preferences.",
          placeholder: "Account settings content..."
        },
        security: {
          title: "Security Settings",
          subtitle: "Manage your password and security settings.",
          placeholder: "Security settings content..."
        }
      }
    },
    quickActions: {
      title: "Quick Actions",
      editProfile: "Edit Profile",
      accountSettings: "Account Settings",
      subscriptionDetails: "Subscription Details",
      getSupport: "Get Support",
      viewDocumentation: "View Documentation"
    },
    accountManagement: {
      title: "Account Management",
      changePassword: {
        title: "Change Password",
        description: "Update your account password",
        oauthDescription: "Password management is not available for social login accounts",
        button: "Change Password",
        dialogDescription: "Please enter your current password and choose a new one",
        form: {
          currentPassword: "Current Password",
          currentPasswordPlaceholder: "Enter your current password",
          newPassword: "New Password",
          newPasswordPlaceholder: "Enter new password (minimum 8 characters)",
          confirmPassword: "Confirm New Password",
          confirmPasswordPlaceholder: "Confirm your new password",
          cancel: "Cancel",
          submit: "Update Password"
        },
        success: "Password updated successfully",
        errors: {
          required: "Please fill in all required fields",
          mismatch: "New passwords do not match",
          minLength: "Password must be at least 8 characters long",
          failed: "Failed to update password. Please try again."
        }
      },
      deleteAccount: {
        title: "Delete Account",
        description: "Permanently delete your account and all associated data",
        button: "Delete Account",
        confirmTitle: "Delete Account",
        confirmDescription: "Are you absolutely sure you want to delete your account?",
        warning: "⚠️ This action cannot be undone",
        consequences: {
          data: "All your personal data will be permanently deleted",
          subscriptions: "Active subscriptions will be cancelled",
          access: "You will lose access to all premium features"
        },
        form: {
          cancel: "Cancel",
          confirm: "Yes, Delete My Account"
        },
        success: "Account deleted successfully",
        errors: {
          failed: "Failed to delete account. Please try again."
        }
      }
    },
    roles: {
      admin: "Administrator",
      user: "User"
    }
  },
  home: {
    metadata: {
      title: "LoomAI - Creative-to-commerce AI imaging for apparel",
      description: "All-in-one AI imaging workspace for apparel teams: text-to-image ideation, fabric design, virtual models, scene-based marketing shots, and multi-angle product exports.",
      keywords: "AI apparel images, text to image, fabric design, virtual model, scene marketing, multi-angle product photos"
    },
    hero: {
      title: "Creative-to-commerce apparel visuals in one workspace",
      titlePrefix: "Creative-to-commerce apparel visuals",
      titleHighlight: "in one workspace",
      titleSuffix: " with AI",
      subtitle: "Type a prompt to get concept boards, swap silk/denim/knit on one style, generate virtual models and scene-based marketing shots, and export detail/flat/on-model sets at once.",
      buttons: {
        purchase: "Book a Demo",
        demo: "View Gallery"
      },
      features: {
        lifetime: "Prompt “2024 spring dress, ditsy floral, French style” to get instant references",
        earlyBird: "Swap silk, denim, or knit materials on one design in seconds"
      }
    },
    features: {
      title: "Copy for the features you plan to ship",
      subtitle: "Creative text-to-image, fabric design, virtual models, scene marketing, and multi-angle outputs in one place.",
      items: [
        {
          title: "Creative text-to-image",
          description: "Type “2024 spring dress, ditsy floral, French style” to get composition, silhouette, and palette references automatically.",
          className: "col-span-1 row-span-1"
        },
        {
          title: "Fabric designer",
          description: "Keep the same pattern while switching silk, denim, or knit, and generate multiple material looks for one style.",
          className: "col-span-1 row-span-1"
        },
        {
          title: "Texture & print generation",
          description: "Generate fabric textures and unique prints with smart repeat, shine, and direction adjustments.",
          className: "col-span-2 row-span-1"
        },
        {
          title: "Virtual model generation",
          description: "Model library with multiple skin tones, body types, and age ranges to match your target shopper.",
          className: "col-span-1 row-span-1"
        },
        {
          title: "Scene-based marketing images",
          description: "Cafe, street, office, and beach presets to create marketing shots and ads in seconds.",
          className: "col-span-2 row-span-1"
        },
        {
          title: "Multi-angle product sets",
          description: "Export detail shots, flat lays, and on-model views together for wholesale and e-commerce.",
          className: "col-span-1 row-span-1"
        },
        {
          title: "Brand style lock",
          description: "Lock your brand’s lighting, palette, and camera language so every batch stays consistent.",
          className: "col-span-1 row-span-1"
        },
        {
          title: "Approvals & version trails",
          description: "Compare versions, capture comments, and control permissions so design, factory, and buyers stay aligned.",
          className: "col-span-1 row-span-1"
        }
      ],
      techStack: {
        title: "A tech stack built for fashion imagery",
        items: [
          "Prompt-to-composition generation",
          "Fabric/material fusion engine",
          "Print creation with repeat correction",
          "Virtual model generation & tuning",
          "Scene lighting and camera presets",
          "Multi-angle export pipeline",
          "Secure asset library with APIs"
        ]
      }
    },
    applicationFeatures: {
      title: "One workflow for prompts, fabrics, models, and scenes",
      subtitle: "Each module matches the features you plan to ship—easy to demo, pilot, and iterate.",
      items: [
        {
          title: "Creative text-to-image workspace",
          subtitle: "From prompts to concept series",
          description: "Enter prompts and style preferences to generate multiple concept versions with composition suggestions tuned to your brand palette and camera language.",
          highlights: [
            "Prompts + brand style lock",
            "Multi-version generation and comparison",
            "Pose/lighting/composition suggestions",
            "Inspiration library with approvals"
          ],
          imageTitle: "Creative Workspace"
        },
        {
          title: "Fabric design & material library",
          subtitle: "Preview one style across materials",
          description: "Swap silk, denim, knit and more on the same style, generate textures and prints, and save parameters, comments, and versions for reuse.",
          highlights: [
            "Accurate shine/texture matching for silk/denim/knit",
            "Print + texture generation with repeat correction",
            "One-click material swaps and batch renders",
            "Save specs, comments, and versions"
          ],
          imageTitle: "Fabric Designer"
        },
        {
          title: "Virtual models & scene marketing",
          subtitle: "Match your audience and channels",
          description: "Choose skin tone, body type, age, and styling, pair with cafe/street/office/beach scenes, and export detail, flat, and on-model shots together.",
          highlights: [
            "Adjustable skin tone/body type/age",
            "Scene presets: cafe, street, office, beach",
            "Batch export detail/flat/on-model angles",
            "Generate compliant ads and buyer decks"
          ],
          imageTitle: "Models & Scenes"
        }
      ]
    },
    roadmap: {
      title: "Product Roadmap",
      subtitle: "Iterating toward prompts, fabrics, virtual models, scenes, and multi-angle exports.",
      items: [
        {
          title: "Creative text-to-image 1.0",
          description: "Prompt templates, brand style locks, and multi-version inspiration generation for fast comparisons.",
          timeline: "2024 Q4",
          status: "in-progress",
          statusText: "In Development",
          features: ["Prompt templates and guardrails", "Brand lighting/palette locks", "Parallel version generation"]
        },
        {
          title: "Fabric designer",
          description: "Swap silk, denim, knit on one style, generate textures/prints, and save fabric parameters.",
          timeline: "2025 Q1",
          status: "planned",
          statusText: "Planned",
          features: ["Silk/denim/knit material switching", "Texture and print generation", "Fabric library with saved params"]
        },
        {
          title: "Virtual model generation",
          description: "Model library with adjustable skin tone, body type, age, plus pose and lighting presets.",
          timeline: "2025 Q1",
          status: "planned",
          statusText: "Planned",
          features: ["Skin tone/body type/age controls", "Pose and lighting presets", "Brand hair and makeup packs"]
        },
        {
          title: "Scene-based marketing templates",
          description: "Cafe, street, office, and beach scenes that output ads and hero images instantly.",
          timeline: "2025 Q2",
          status: "planned",
          statusText: "Planned",
          features: ["Scene template library", "Ad/poster aspect ratios", "Batch export for channel sizes"]
        },
        {
          title: "Multi-angle product pipeline",
          description: "Automate detail, flat, and on-model shots with cutouts and annotations.",
          timeline: "2025 Q2",
          status: "planned",
          statusText: "Planned",
          features: ["Detail/flat/on-model sets", "Auto cutout and markup", "PSD/PNG/WebP exports"]
        },
        {
          title: "Collaboration & approvals workspace",
          description: "Version comparison, comments, and permissions with upcoming PLM/ERP/DAM connectors.",
          timeline: "2025 Q3",
          status: "planned",
          statusText: "Planned",
          features: ["Version comparison and comments", "Roles, permissions, and audit", "PLM/ERP/DAM connectors"]
        }
      ],
      footer: "Roadmap updated monthly—request early access to upcoming modules."
    },
    stats: {
      title: "Built for apparel leaders",
      items: [
        {
          value: "600",
          suffix: "+",
          label: "Fashion brands prototyping drops"
        },
        {
          value: "80",
          suffix: "+",
          label: "Factories & sourcing partners onboarded"
        },
        {
          value: "25000",
          suffix: "+",
          label: "AI renders shipped every week"
        },
        {
          value: "48",
          suffix: "h",
          label: "Average lead time saved per drop"
        }
      ]
    },
    testimonials: {
      title: "Trusted by fashion teams",
      items: [
        {
          quote: "We replaced 70% of our sampling photoshoots—buyers still get full lookbooks, but we approve assortments two weeks sooner.",
          author: "Lena Chen",
          role: "VP Merchandising, NovaWear"
        },
        {
          quote: "Factories finally see the same brief as the brand. Comments, approvals, and assets stay in one secure timeline.",
          author: "Marco Ruiz",
          role: "COO, Atelier Sourcing"
        },
        {
          quote: "Localization used to take days per retailer. Now we deliver compliant images for 14 markets overnight.",
          author: "Emily Hart",
          role: "Head of Digital Wholesale, Loom Collective"
        }
      ]
    },
    finalCta: {
      title: "Want to build this with us?",
      subtitle: "If you need creative prompts, fabric design, virtual models, and scene marketing images, book a demo or join the beta list.",
      buttons: {
        purchase: "Book a Demo",
        demo: "Join Beta"
      }
    },
    footer: {
      copyright: "© {year} LoomAI. All rights reserved.",
      description: "LoomAI — AI Fashion Imaging Infrastructure"
    },
    common: {
      demoInterface: "AI workspace preview",
      techArchitecture: "Enterprise-grade infrastructure for fashion supply chains",
      learnMore: "Learn More"
    }
  },
  ai: {
    metadata: {
      title: "LoomAI - AI Model Generator",
      description: "Generate photorealistic apparel model shots from a single sentence. Built for fashion brands that need on-model imagery without a photoshoot.",
      keywords: "AI model generator, fashion lookbook AI, apparel imagery, text to image, runway AI"
    },
    nanoBanana: {
      title: "Nano Banana 2 Image Lab",
      subtitle: "Test the Nano Banana 2 (Gemini 3) pipeline for text-to-image and image-to-image. Great for catalog portraits, hero banners, and quick outfit swaps.",
      promptTitle: "Creative brief",
      promptDescription: "Describe what you want. Add references for image-to-image or editing flows.",
      promptLabel: "Prompt",
      promptPlaceholder: "e.g. Editorial portrait of a streetwear model in Tokyo neon, 3:4, cinematic light",
      promptHelper: "Keep it short: subject + styling + lighting + mood.",
      modelLabel: "Model",
      modelHelper: "Switch between ultra-fast Z Image Turbo, Nano Banana 2 Lite, or Gemini 3 Pro (preview).",
      sizeLabel: "Aspect ratio",
      qualityLabel: "Quality",
      qualityHelper: "4K uses more credits. 2K is a good balance. Z Image Turbo ignores quality (size only).",
      models: {
        "z-image-turbo": "Z Image Turbo",
        "nano-banana-2-lite": "Nano Banana 2 Lite",
        "gemini-3-pro-image-preview": "Gemini 3 Pro Image Preview",
      },
      referencesTitle: "Reference images",
      referencesDescription: "Optional: drop files to run image-to-image or editing.",
      referencesCta: "Drag & drop or click to upload",
      referencesHelper: "JPG/PNG/WebP • up to 5 • ≤10MB each",
      referenceHint: "Photo 1 is treated as the strongest reference.",
      uploadCta: "Upload from device",
      uploading: "Uploading…",
      statusTitle: "Async task status",
      statusDescription: "Submit, then poll. Links stay live for 24h.",
      resultTitle: "Output preview",
      resultDescription: "The first returned URL is shown here.",
      errorState: "Generation failed. Tweak the prompt or try again.",
      generateCta: "Generate with Nano Banana 2",
      generating: "Submitting…",
      resetCta: "Reset",
      downloadCta: "Download",
      downloading: "Downloading…",
      badges: {
        model: "Model: Nano Banana 2 (Gemini 3)",
        async: "Async: returns task ID",
        expiry: "Images valid for 24h",
      },
      scenariosTitle: "Quick recipes",
      scenarios: [
        {
          title: "Catalog studio (text-to-image)",
          prompt: "Studio portrait of a female model wearing a cropped denim jacket and pleated midi skirt, soft daylight, neutral backdrop, 3:4.",
        },
        {
          title: "Street lookbook",
          prompt: "Streetwear male model in Tokyo alley at night, oversized bomber jacket with graphic tee, neon rim light, 3:4.",
        },
        {
          title: "Packshot to hero (image-to-image)",
          prompt: "Turn the reference packshot into an on-body hero image, keep fabric and logo exactly the same, minimal studio background.",
        },
        {
          title: "Retouch & relight",
          prompt: "Relight the reference portrait to warm sunset glow, keep the face and wardrobe identical, subtle film grain.",
        },
      ],
      checklistTitle: "Run checklist",
      checklistDescription: "Make sure inputs match the mode you want.",
      checklistItems: {
        references: "Add a reference to switch into image-to-image or editing.",
        prompt: "State subject + styling + light. Short and concrete beats long.",
        quality: "Choose 1K/2K/4K. 2K recommended for most tests.",
        model: "Pick a model: Turbo for speed, Nano Lite for I2I/edit, Gemini for fidelity.",
      },
      linkNotice: "Result URLs expire in 24h. Download if you need to archive.",
      toasts: {
        requiredPrompt: "Please enter a prompt.",
        invalidType: "Only image files are supported.",
        fileTooLarge: "Images must be 10MB or smaller.",
        maxFiles: "You can upload up to 5 images.",
        error: "Unable to submit task. Please try again.",
      },
    },
    promptExtractor: {
      title: "Image Prompt Extractor",
      subtitle: "Upload a reference image and let GPT-5 Nano break it into ready-to-use prompt keywords.",
      uploadTitle: "Reference image",
      uploadDescription: "Drop one JPG/PNG/WebP (≤10MB). We convert it to a secure data URL and call APIMart.",
      uploadLimit: "Single image · JPG/PNG/WebP · ≤10MB",
      dropLabel: "Drag & drop or click to upload",
      removeLabel: "Remove image",
      helper: "Output covers subject, garment/fabric, background, lighting, camera framing, and mood.",
      hintsLabel: "Optional instruction",
      hintsPlaceholder: "e.g. reply in English, highlight lens & palette, keep under 100 tokens",
      cta: "Extract prompt",
      analyzing: "Analyzing image…",
      resultTitle: "Prompt result",
      resultDescription: "Copy the AI-composed prompt for your image-to-image or diffusion jobs.",
      copy: "Copy prompt",
      copied: "Prompt copied",
      usageLabel: "Token usage",
      usageTokens: {
        prompt: "Prompt tokens",
        completion: "Completion tokens",
        total: "Total tokens",
      },
      badges: {
        model: "Model: gpt-5-nano",
        endpoint: "Endpoint: /v1/responses",
        vision: "Vision ready",
      },
      statuses: {
        idle: "Waiting for an image",
        analyzing: "Analyzing…",
        success: "Prompt ready",
        error: "Extraction failed",
      },
      toasts: {
        missingImage: "Please upload an image first.",
        invalidType: "Only JPG/PNG/WebP files are supported.",
        fileTooLarge: "Images must be 10MB or smaller.",
        error: "Unable to extract prompt. Please try again.",
        success: "Prompt extracted successfully.",
      },
    },
    generator: {
      title: "Describe the look. LoomAI renders the model.",
      subtitle: "Create editorial-ready on-model shots for apparel drops in seconds. Default: Z Image Turbo for fastest text-to-image. Upload references and we auto-switch to Nano Banana 2 (Gemini 3) for fusion.",
      badges: {
        model: "Default: Z Image Turbo · References: Nano Banana 2",
        turnaround: "<30s average turnaround",
        usage: "Links stay live for 24h"
      },
      form: {
        title: "Prompt the lookbook",
        description: "Specify silhouette, fabric cues, lighting, and any direction the factory or buyer should see.",
        promptLabel: "Creative brief",
        promptPlaceholder: "e.g. Minimalist linen suit on tall Asian model, soft daylight studio, 3:4 portrait",
        promptHelper: "Start with garment type + styling + model attributes + lighting/camera feeling.",
        sizeLabel: "Aspect ratio",
        sizePlaceholder: "Select a ratio",
        sizeHelper: "Portrait ratios (3:4 / 9:16) work best for lookbooks and PDP hero shots.",
        qualityLabel: "Fabric fidelity",
        qualityHelper: "We lock in calibrated apparel checkpoints so pleats, seams, and trims remain intact.",
        ratioLabels: {
          auto: "Auto (respect source)",
          "3:4": "3:4 Editorial Portrait",
          "4:3": "4:3 Catalog Spread",
          "1:1": "1:1 Social / PDP square",
          "9:16": "9:16 Mobile hero",
          "16:9": "16:9 Campaign landscape",
          "2:3": "2:3 Runway crop",
          "3:2": "3:2 Magazine crop",
          "4:5": "4:5 Poster portrait",
          "5:4": "5:4 Gallery frame",
          "21:9": "21:9 Cinematic banner"
        },
        submit: "Generate model",
        generating: "Generating…",
        newRender: "Reset",
        validation: {
          requiredPrompt: "Please describe the look you want to render."
        }
      },
      fusion: {
        title: "Reference fusion",
        description: "Upload references to fuse. We treat Photo 1 as the model identity and Photo 2 as the exact garment.",
        badge: "Photo fusion",
        helper: "Drag JPG/PNG/WebP here. Up to 5 images, each ≤10MB.",
        limit: "Supports up to 5 reference images • JPG/PNG/WebP • ≤10MB each.",
        emptyTitle: "Drop or select references",
        emptyDescription: "Photo 1 = model reference, Photo 2 = garment reference. Additional photos add detail or background context.",
        selectFiles: "Select images",
        addMore: "Add {count} more",
        orderHint: "Photo 1 locks the model identity, Photo 2 copies the outfit exactly.",
        photoLabel: "Photo {index}",
        previewAlt: "Reference image {index}",
        removeLabel: "Remove image",
        directiveTitle: "Default instruction we append",
        defaultPrompt: "Take the person from the model reference (Photo 1) and dress them in the exact garment from the garment reference (Photo 2) with no other alterations. Preserve faces, poses, proportions, and camera framing exactly while copying the garment fabric, colors, prints, trims, and construction one-to-one.",
        errors: {
          maxFiles: "You can upload up to 5 images.",
          invalidType: "Only image files are supported.",
          fileTooLarge: "Reference images must be 10MB or smaller."
        }
      },
      sectionNav: {
        title: "Jump to",
        fusion: "Fusion",
        prompt: "Prompt",
        status: "Status",
        result: "Result"
      },
      status: {
        idle: "Ready to generate",
        creating: "Submitting task",
        polling: "Rendering in progress",
        completed: "Render completed",
        failed: "Generation failed"
      },
      statusCard: {
        title: "Task status",
        description: "We create an async task on Evolink and monitor it for you.",
        eta: "Avg ETA: {seconds}",
        elapsed: "Elapsed: {time}",
        progress: "Progress {value}",
        lastPromptTitle: "Last prompt"
      },
      samples: {
        title: "Quick prompts",
        description: "Use these as starting points and tweak fabrics, attitudes, or locales.",
        items: [
          "Runway-ready denim two-piece on athletic Asian female model, 3:4 portrait, cinematic rim light",
          "Luxury charcoal suit on tall Black male model, minimalist studio, 4:3 lookbook crop",
          "Playful kidswear raincoat with transparent PVC, smiling child model, 9:16 hero frame",
          "Performance athleisure co-ord, rooftop sunset, energetic pose, 2:3 campaign shot"
        ]
      },
      result: {
        title: "Latest render",
        description: "Download instantly or brief the team with the generated link.",
        alt: "Generated apparel model image",
        download: "Download image",
        newPrompt: "Try another prompt",
        emptyTitle: "Your canvas is waiting",
        emptyDescription: "Describe the garment and styling above to see the model appear here."
      },
      toasts: {
        completed: "Model image ready.",
        error: "Unable to generate image. Please try again."
      }
    },
    fabricDesigner: {
      hero: {
        badge: "Fabric design lab",
        title: "Swap any garment into silk, denim, or knits without another shoot.",
        subtitle: "Upload one model reference, pick the textile palette, and let LoomAI simulate new materials while faces, poses, and backgrounds remain locked.",
        highlights: [
          "Silk / denim / knit presets",
          "Print & pattern builder",
          "One-click multi-material preview"
        ]
      },
      featureCards: {
        materialSwap: {
          title: "Multi-material wardrobe",
          description: "Queue silk, denim, knit, or fully custom textiles on a single outfit to answer buyer requests instantly."
        },
        textureLab: {
          title: "Texture & print lab",
          description: "Control weave gloss, repeat scale, and bespoke motifs with promptable pattern tools."
        },
        previewDeck: {
          title: "Consistent previews",
          description: "Results stay faithful to the uploaded model for apples-to-apples fabric reviews."
        }
      },
      upload: {
        title: "Reference upload",
        description: "Use any on-model photo shot in your showroom or studio.",
        helper: "Well lit garments with full silhouettes work best.",
        dragLabel: "Drag & drop the reference or browse",
        replace: "Select reference",
        clear: "Clear image",
        limit: "JPEG/PNG up to 10MB. Keep backgrounds tidy for best fidelity.",
        previewAlt: "Uploaded model reference"
      },
      fabricsSection: {
        title: "Fabric palette",
        subtitle: "Pick the materials you want to preview. We render them sequentially.",
        batchHint: "Multiple selections queue automatically"
      },
      fabrics: {
        silk: {
          title: "Silk gloss",
          description: "Charmeuse, satin, and organza highlights with fluid drape."
        },
        denim: {
          title: "Denim twill",
          description: "Structured indigo twill with visible grain and seam contrast."
        },
        knit: {
          title: "Knit texture",
          description: "Rib, jersey, and sweater stitches with soft yarn detail."
        },
        custom: {
          title: "Custom textile",
          description: "Describe specialty fabrics, blends, or tech materials."
        }
      },
      customFabric: {
        label: "Custom fabric name",
        placeholder: "e.g. Metallic jacquard",
        helper: "Used inside prompts and gallery labels."
      },
      prints: {
        title: "Print & texture direction",
        description: "Optional. Describe repeating motifs, embroidery, or weaving rhythm.",
        placeholder: "e.g. tone-on-tone floral jacquard with 4cm repeat",
        scaleLabel: "Pattern scale",
        scaleHelper: "Smaller numbers tighten repeats, larger numbers loosen them."
      },
      controls: {
        textureStrengthLabel: "Fabric fidelity",
        textureStrengthHelper: "Blend weight: {value}",
        lockModel: "Lock model identity",
        lockModelHelper: "Keep the face, pose, and proportions identical to the reference.",
        preserveBackground: "Preserve background",
        preserveBackgroundHelper: "Keep the original set design untouched.",
        advancedNotesLabel: "Art direction notes",
        advancedNotesPlaceholder: "Scene direction, finishing notes, merch feedback…"
      },
      queue: {
        title: "Variation queue",
        description: "Selections run one after another.",
        queueCount: "{count} fabric(s) queued",
        empty: "Select at least one fabric preset",
        stop: "Stop queue"
      },
      generator: {
        actionSingle: "Generate fabric preview",
        actionBatch: "Generate selected fabrics",
        generating: "Sending to loom…"
      },
      status: {
        idle: "Waiting for upload",
        creating: "Uploading reference",
        polling: "Simulating fabric",
        completed: "Preview ready",
        failed: "Something went wrong"
      },
      statusCard: {
        title: "Render status",
        description: "We launch Evolink jobs and stream progress here.",
        eta: "Avg ETA: {seconds}",
        elapsed: "Elapsed: {time}",
        progress: "Progress {value}",
        activeFabric: "Current fabric: {fabric}",
        queueDepth: "{count} more waiting"
      },
      result: {
        title: "Latest fabric render",
        description: "Download instantly or brief sourcing teams.",
        alt: "Fabric retexture result",
        download: "Download PNG",
        emptyTitle: "Awaiting your first fabric",
        emptyDescription: "Upload a model reference and trigger a fabric render to preview it here."
      },
      gallery: {
        title: "Fabric variation deck",
        subtitle: "Compare outputs per fabric for merchandising approvals.",
        emptyTitle: "No saved fabrics yet",
        emptyDescription: "Every completed render will appear here with its fabric label.",
        generatedAt: "Generated {time}",
        download: "Download"
      },
      toasts: {
        imageRequired: "Please upload a reference model image first.",
        fabricRequired: "Select at least one fabric to preview.",
        customFabricRequired: "Name your custom fabric so we can describe it precisely.",
        queueStarted: "{count} fabrics queued.",
        queueCleared: "Queue cleared. Current tracking stopped.",
        completed: "Fabric preview is ready.",
        error: "Unable to render fabric preview.",
        fileTooLarge: "Please upload an image smaller than 10MB.",
        invalidFileType: "Only image uploads are supported."
      }
    },
    tryOn: {
      hero: {
        badge: "Virtual fitting lab",
        title: "See your model wearing any street snap or catalog outfit.",
        subtitle:
          "Upload the model photo (Photo 1) and the garment photo (Photo 2). We upload to OSS and call Nano Banana 2 (Gemini 3) to dress Photo 1 in the exact outfit from Photo 2.",
        highlights: ["Photo 1 model + Photo 2 garment", "OSS upload + async task", "Powered by Nano Banana 2"]
      },
      uploadSection: {
        title: "Upload references",
        description: "We need both the model you want to dress and the garment you want to borrow.",
        limit: "JPG/PNG/WebP up to 10MB. Clear lighting helps.",
        replace: "Choose file",
        clear: "Clear image"
      },
      modelUpload: {
        title: "Model reference",
        description: "Front-facing or angled on-model image works best.",
        helper: "Keep the pose you want."
      },
      garmentUpload: {
        title: "Garment reference",
        description: "Use a clothing flat, mannequin, or someone else wearing it.",
        helper: "Crop tight to the outfit."
      },
      simplePrompt: "Take the person from photo 1 and put on the exact outfit from photo 2, keeping the identity and pose unchanged.",
      controls: {
        backgroundLabel: "Background handling",
        backgroundPlaceholder: "Choose a background rule",
        backgroundOptions: [
          { value: "preserve", label: "Preserve", helper: "Never touch the original set." },
          { value: "studio", label: "Studio align", helper: "Allow subtle cleanup into neutral sweeps." },
          { value: "street", label: "Street vibe", helper: "Permit light lifestyle adjustments." },
          { value: "custom", label: "Adaptive", helper: "Let Evolink harmonize with garment mood." }
        ],
        fitLabel: "Fit tightness",
        fitHelper: "Lower = relaxed drape, higher = body-conscious.",
        accessoriesLabel: "Keep accessories",
        accessoriesHelper: "Lock jewelry, hair, makeup, props.",
        notesLabel: "Art director notes",
        notesPlaceholder: "e.g. keep same belt, soften shadows, retain shoulder bag…"
      },
      actions: {
        cta: "Dress the model",
        generating: "Transferring outfit…",
        reset: "Reset"
      },
      status: {
        idle: "Waiting for uploads",
        creating: "Uploading references",
        polling: "Applying garment",
        completed: "Try-on ready",
        failed: "Generation failed"
      },
      statusCard: {
        title: "Try-on status",
        description: "We spin up an Evolink task and monitor progress.",
        eta: "Avg ETA: {seconds}",
        elapsed: "Elapsed: {time}",
        progress: "Progress {value}"
      },
      result: {
        title: "Latest try-on render",
        description: "Download and send to sourcing, styling, or e-comm.",
        alt: "Virtual try-on image",
        download: "Download image",
        emptyTitle: "No output yet",
        emptyDescription: "Upload both references and start a try-on to preview here."
      },
      history: {
        title: "Try-on archive",
        subtitle: "Every render is saved for quick reference.",
        emptyTitle: "Waiting for your first transfer",
        emptyDescription: "Once a try-on completes it will appear here.",
        generatedAt: "Generated {time}",
        download: "Download",
        defaultLabel: "Transferred outfit"
      },
      toasts: {
        modelRequired: "Upload the model reference first.",
        garmentRequired: "Upload the garment reference you want to transfer.",
        invalidFileType: "Only image uploads are supported.",
        fileTooLarge: "Images must be 10MB or smaller.",
        error: "Unable to run virtual try-on.",
        completed: "Try-on completed."
      }
    }
  },
  premiumFeatures: {
    metadata: {
      title: "TinyShip - Premium Features",
      description: "Explore all the premium features available with your subscription. Access advanced tools, AI assistance, and enhanced functionality.",
      keywords: "premium, features, advanced, tools, subscription, benefits, enhanced"
    },
    title: "Premium Features",
    description: "Thank you for your subscription! Here are all the premium features you can now access.",
    loading: "Loading...",
    subscription: {
      title: "Your Subscription",
      description: "Current subscription status and details",
      status: "Subscription Status",
      type: "Subscription Type",
      expiresAt: "Expires At",
      active: "Active",
      inactive: "Inactive",
      lifetime: "Lifetime Member",
      recurring: "Recurring Subscription"
    },
    badges: {
      lifetime: "Lifetime Member"
    },
    demoNotice: {
      title: "🎯 SaaS Template Demo Page",
      description: "This is a demo page for testing route protection. Only paying users can access this page, demonstrating how to implement subscription-level access control in your SaaS application."
    },
    features: {
      userManagement: {
        title: "Advanced User Management",
        description: "Complete user profile management and custom settings"
      },
      aiAssistant: {
        title: "AI Smart Assistant",
        description: "Advanced artificial intelligence features to boost productivity"
      },
      documentProcessing: {
        title: "Unlimited Document Processing",
        description: "Process any number and size of document files"
      },
      dataAnalytics: {
        title: "Detailed Data Analytics",
        description: "In-depth data analysis and visualization reports"
      }
    },
    actions: {
      accessFeature: "Access Feature"
    }
  },
  validators: {
    user: {
      name: {
        minLength: "Name must be at least {min} characters",
        maxLength: "Name must be less than {max} characters"
      },
      email: {
        invalid: "Please enter a valid email address"
      },
      image: {
        invalidUrl: "Please enter a valid URL"
      },
      password: {
        minLength: "Password must be at least {min} characters",
        maxLength: "Password must be less than {max} characters",
        mismatch: "Passwords don't match"
      },
      countryCode: {
        required: "Please select country/region"
      },
      phoneNumber: {
        required: "Please enter phone number",
        invalid: "Invalid phone number format"
      },
      verificationCode: {
        invalidLength: "Verification code must be {length} characters"
      },
      id: {
        required: "User ID is required"
      },
      currentPassword: {
        required: "Current password is required"
      },
      confirmPassword: {
        required: "Please confirm your password"
      },
      deleteAccount: {
        confirmRequired: "You must confirm account deletion"
      }
    }
  },
  countries: {
    china: "China",
    usa: "United States",
    uk: "United Kingdom",
    japan: "Japan",
    korea: "South Korea",
    singapore: "Singapore",
    hongkong: "Hong Kong",
    macau: "Macau",
    australia: "Australia",
    france: "France",
    germany: "Germany",
    india: "India",
    malaysia: "Malaysia",
    thailand: "Thailand"
  },
  header: {
    navigation: {
      menu: "Features",
      ai: "AI Model Studio",
      fabric: "Fabric Designer",
      tryOn: "Virtual Try-On",
      nano: "Nano",
      promptExtractor: "Prompt Extractor",
      premiumFeatures: "Premium Features",
      pricing: "Pricing"
    },
    auth: {
      signIn: "Sign In",
      getStarted: "Get Started",
      signOut: "Sign Out"
    },
    userMenu: {
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      personalSettings: "Personal Settings",
      adminPanel: "Admin Panel"
    },
    language: {
      switchLanguage: "Switch Language",
      english: "English",
      chinese: "中文"
    },
    mobile: {
      themeSettings: "Theme Settings",
      languageSelection: "Language Selection"
    }
  }
} as const; 
