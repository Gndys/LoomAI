import type { Locale } from './types'

export const zhCN: Locale = {
  common: {
    welcome: "欢迎使用 LoomAI",
    siteName: "LoomAI",
    login: "登录",
    signup: "注册",
    logout: "退出登录",
    profile: "个人资料",
    settings: "设置",
    and: "和",
    loading: "加载中...",
    unexpectedError: "发生了意外错误",
    notAvailable: "不可用",
    viewPlans: "查看计划",
    yes: "是",
    no: "否",
    theme: {
      light: "浅色主题",
      dark: "深色主题",
      system: "系统主题",
      toggle: "切换主题",
      appearance: "外观设置",
      colorScheme: "配色方案",
      themes: {
        default: "默认主题",
        claude: "Claude主题",
        "cosmic-night": "宇宙之夜",
        "modern-minimal": "现代简约",
        "ocean-breeze": "海洋微风"
      }
    }
  },
  navigation: {
    home: "首页",
    dashboard: "仪表盘",
    orders: "订单",
    shipments: "发货",
    tracking: "追踪",
    admin: {
      dashboard: "仪表盘",
      users: "用户管理",
      subscriptions: "订阅管理",
      orders: "订单管理",
      application: "应用程序"
    }
  },
  actions: {
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑",
    tryAgain: "重试",
    createAccount: "创建账户",
    sendCode: "发送验证码",
    verify: "验证",
    backToList: "返回用户列表",
    saveChanges: "保存更改",
    createUser: "创建用户",
    deleteUser: "删除用户",
    back: "返回",
    resendCode: "重新发送",
    resendVerificationEmail: "重新发送验证邮件"
  },
  email: {
    verification: {
      subject: "验证您的 TinyShip 账号",
      title: "请验证您的邮箱地址",
      greeting: "您好 {{name}}，",
      message: "感谢您注册 TinyShip。要完成注册，请点击下方按钮验证您的电子邮箱地址。",
      button: "验证邮箱地址",
      alternativeText: "或者，您可以复制并粘贴以下链接到浏览器中：",
      expiry: "此链接将在 {{expiry_hours}} 小时后过期。",
      disclaimer: "如果您没有请求此验证，请忽略此邮件。",
      signature: "祝您使用愉快，TinyShip 团队",
      copyright: "© {{year}} TinyShip. 保留所有权利。"
    },
    resetPassword: {
      subject: "重置您的 TinyShip 密码",
      title: "重置您的密码",
      greeting: "您好 {{name}}，",
      message: "我们收到了重置您密码的请求。请点击下方按钮创建新密码。如果您没有提出此请求，可以安全地忽略此邮件。",
      button: "重置密码",
      alternativeText: "或者，您可以复制并粘贴以下链接到浏览器中：",
      expiry: "此链接将在 {{expiry_hours}} 小时后过期。",
      disclaimer: "如果您没有请求重置密码，无需进行任何操作。",
      signature: "祝您使用愉快，TinyShip 团队",
      copyright: "© {{year}} TinyShip. 保留所有权利。"
    }
  },
  auth: {
    metadata: {
      signin: {
        title: "TinyShip - 登录",
        description: "登录您的 TinyShip 账户，访问仪表板、管理订阅并使用高级功能。",
        keywords: "登录, 账户登录, 身份验证, 访问账户, 仪表板"
      },
      signup: {
        title: "TinyShip - 创建账户",
        description: "创建您的 TinyShip 账户，开始使用我们全面的脚手架构建出色的 SaaS 应用程序。",
        keywords: "注册, 创建账户, 新用户, 开始使用, 账户注册"
      },
      forgotPassword: {
        title: "TinyShip - 重置密码",
        description: "安全地重置您的 TinyShip 账户密码。输入您的邮箱以接收密码重置说明。",
        keywords: "忘记密码, 重置密码, 密码恢复, 账户恢复"
      },
      resetPassword: {
        title: "TinyShip - 创建新密码",
        description: "为您的 TinyShip 账户创建新的安全密码。选择强密码来保护您的账户。",
        keywords: "新密码, 密码重置, 安全密码, 账户安全"
      },
      phone: {
        title: "TinyShip - 手机登录",
        description: "使用手机号登录 TinyShip。通过短信验证进行快速安全的身份验证。",
        keywords: "手机登录, 短信验证, 移动端认证, 手机号码"
      },
      wechat: {
        title: "TinyShip - 微信登录",
        description: "使用微信账户登录 TinyShip。为中国用户提供便捷的身份验证。",
        keywords: "微信登录, WeChat登录, 社交登录, 中国认证"
      }
    },
    signin: {
      title: "登录您的账户",
      welcomeBack: "欢迎回来",
      socialLogin: "使用您喜欢的社交账号登录",
      continueWith: "或继续使用",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      password: "密码",
      forgotPassword: "忘记密码？",
      rememberMe: "记住我",
      submit: "登录",
      submitting: "登录中...",
      noAccount: "还没有账户？",
      signupLink: "注册",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      socialProviders: {
        google: "Google",
        github: "GitHub",
        apple: "Apple",
        wechat: "微信",
        phone: "手机号码"
      },
      errors: {
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        requiredPassword: "请输入密码",
        invalidCredentials: "邮箱或密码错误",
        captchaRequired: "请完成验证码验证",
        emailNotVerified: {
          title: "需要邮箱验证",
          description: "请检查您的邮箱并点击验证链接。如果您没有收到邮件，可以点击下方按钮重新发送。",
          resendSuccess: "验证邮件已重新发送，请检查您的邮箱。",
          resendError: "重发验证邮件失败，请稍后重试。",
          dialogTitle: "重新发送验证邮件",
          dialogDescription: "请完成验证码验证后重新发送验证邮件",
          emailLabel: "邮箱地址",
          sendButton: "发送验证邮件",
          sendingButton: "发送中...",
          waitButton: "等待 {seconds}s"
        }
      }
    },
    signup: {
      title: "注册 TinyShip",
      createAccount: "创建账户",
      socialSignup: "使用您喜欢的社交账号注册",
      continueWith: "或继续使用",
      name: "姓名",
      namePlaceholder: "请输入您的姓名",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      password: "密码",
      passwordPlaceholder: "创建密码",
      imageUrl: "头像图片链接",
      imageUrlPlaceholder: "https://example.com/your-image.jpg",
      optional: "可选",
      submit: "创建账户",
      submitting: "创建账户中...",
      haveAccount: "已有账户？",
      signinLink: "登录",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      verification: {
        title: "需要验证",
        sent: "我们已经发送验证邮件到",
        checkSpam: "找不到邮件？请检查垃圾邮件文件夹。",
        spamInstruction: "如果仍然没有收到，"
      },
      errors: {
        invalidName: "请输入有效的姓名",
        requiredName: "请输入姓名",
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        invalidPassword: "请输入有效的密码",
        requiredPassword: "请输入密码",
        invalidImage: "请输入有效的图片链接",
        captchaRequired: "请完成验证码验证",
        captchaError: "验证码验证失败，请重试",
        captchaExpired: "验证码已过期，请重新验证"
      }
    },
    phone: {
      title: "手机号登录",
      description: "输入您的手机号以接收验证码",
      phoneNumber: "手机号",
      phoneNumberPlaceholder: "请输入您的手机号",
      countryCode: "国家/地区",
      verificationCode: "验证码",
      enterCode: "输入验证码",
      sendingCode: "发送验证码中...",
      verifying: "验证中...",
      codeSentTo: "已发送验证码到",
      resendIn: "重新发送",
      seconds: "秒",
      resendCode: "重新发送",
      resendCountdown: "秒后可重新发送",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      errors: {
        invalidPhone: "请输入有效的手机号",
        requiredPhone: "请输入手机号",
        requiredCountryCode: "请选择国家/地区",
        invalidCode: "请输入有效的验证码",
        requiredCode: "请输入验证码",
        captchaRequired: "请完成验证码验证"
      }
    },
    forgetPassword: {
      title: "忘记密码",
      description: "重置密码并重新获得账户访问权限",
      email: "邮箱",
      emailPlaceholder: "请输入邮箱地址",
      submit: "发送重置链接",
      submitting: "发送中...",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      verification: {
        title: "检查您的邮箱",
        sent: "我们已经发送重置密码链接到",
        checkSpam: "找不到邮件？请检查垃圾邮件文件夹。"
      },
      errors: {
        invalidEmail: "请输入有效的邮箱地址",
        requiredEmail: "请输入邮箱",
        captchaRequired: "请完成验证码验证"
      }
    },
    resetPassword: {
      title: "重置密码",
      description: "为您的账户创建新密码",
      password: "新密码",
      passwordPlaceholder: "请输入新密码",
      confirmPassword: "确认密码",
      confirmPasswordPlaceholder: "请再次输入新密码",
      submit: "重置密码",
      submitting: "重置中...",
      success: {
        title: "密码重置成功",
        description: "您的密码已经成功重置。",
        backToSignin: "返回登录",
        goToSignIn: "返回登录"
      },
      errors: {
        invalidPassword: "密码长度至少为8个字符",
        requiredPassword: "请输入密码",
        passwordsDontMatch: "两次输入的密码不一致",
        invalidToken: "重置链接无效或已过期，请重试。"
      }
    },
    wechat: {
      title: "微信登录",
      description: "使用微信扫码登录",
      scanQRCode: "请使用微信扫描二维码",
      orUseOtherMethods: "或使用其他登录方式",
      loadingQRCode: "加载二维码中...",
      termsNotice: "点击继续即表示您同意我们的",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      errors: {
        loadingFailed: "微信二维码加载失败",
        networkError: "网络错误，请重试"
      }
    },
    // Better Auth 错误代码映射
    authErrors: {
      USER_ALREADY_EXISTS: "该邮箱已被注册",
      INVALID_EMAIL_OR_PASSWORD: "邮箱或密码错误",
      EMAIL_NOT_VERIFIED: "请先验证您的邮箱地址",
      USER_NOT_FOUND: "未找到该邮箱对应的账户",
      INVALID_CREDENTIALS: "提供的凭据无效",
      ACCOUNT_BLOCKED: "您的账户已被临时冻结",
      TOO_MANY_REQUESTS: "登录尝试次数过多，请稍后重试",
      INVALID_TOKEN: "无效或已过期的令牌",
      SESSION_EXPIRED: "您的会话已过期，请重新登录",
      PHONE_NUMBER_ALREADY_EXISTS: "该手机号已被注册",
      INVALID_PHONE_NUMBER: "手机号格式无效",
      OTP_EXPIRED: "验证码已过期",
      INVALID_OTP: "验证码错误",
      OTP_TOO_MANY_ATTEMPTS: "验证尝试次数过多，请重新获取验证码",
      CAPTCHA_REQUIRED: "请完成验证码验证",
      CAPTCHA_INVALID: "验证码验证失败",
      EMAIL_SEND_FAILED: "邮件发送失败，请稍后重试",
      SMS_SEND_FAILED: "短信发送失败，请稍后重试",
      UNKNOWN_ERROR: "发生未知错误"
    }
  },
  admin: {
    metadata: {
      title: "TinyShip - 管理后台",
      description: "全面的管理仪表板，用于管理用户、订阅、订单和系统分析，为您的SaaS应用提供强大的管理功能。",
      keywords: "管理后台, 仪表板, 管理, SaaS, 分析, 用户, 订阅, 订单"
    },
    dashboard: {
      title: "管理员仪表板",
      accessDenied: "访问被拒绝",
      noPermission: "您没有权限访问管理员仪表板",
      lastUpdated: "最后更新",
      metrics: {
        totalRevenue: "总收入",
        totalRevenueDesc: "历史总收入",
        newCustomers: "本月新客户",
        newCustomersDesc: "本月新增客户数",
        newOrders: "本月新订单",
        newOrdersDesc: "本月新增订单数",
        fromLastMonth: "较上月"
      },
      chart: {
        monthlyRevenueTrend: "月度收入趋势",
        revenue: "收入",
        orders: "订单数"
      },
      todayData: {
        title: "今日数据",
        revenue: "收入",
        newUsers: "新用户",
        orders: "订单数"
      },
      monthData: {
        title: "本月数据",
        revenue: "本月收入",
        newUsers: "本月新用户",
        orders: "本月订单数"
      },
      recentOrders: {
        title: "最近订单",
        orderId: "订单ID",
        customer: "客户",
        plan: "计划",
        amount: "金额",
        provider: "支付方式",
        status: "状态",
        time: "时间",
        total: "总计"
      }
    },
    users: {
      title: "用户管理",
      subtitle: "管理用户、角色和权限",
      createUser: "创建用户",
      editUser: "编辑用户",
      actions: {
        addUser: "添加用户",
        editUser: "编辑用户",
        deleteUser: "删除用户",
        banUser: "封禁用户",
        unbanUser: "解封用户"
      },
      table: {
        columns: {
          id: "ID",
          name: "姓名",
          email: "邮箱",
          role: "角色",
          phoneNumber: "手机号",
          emailVerified: "邮箱验证",
          banned: "封禁状态",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          actions: "操作"
        },
        actions: {
          editUser: "编辑用户",
          deleteUser: "删除用户",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        },
        noResults: "未找到用户",
        search: {
          searchBy: "搜索字段",
          searchPlaceholder: "搜索 {field}...",
          filterByRole: "按角色筛选",
          allRoles: "所有角色",
          banStatus: "封禁状态",
          allUsers: "所有用户",
          bannedUsers: "已封禁",
          notBannedUsers: "未封禁",
          view: "视图",
          toggleColumns: "切换列显示"
        },
        pagination: {
          showing: "显示第 {start} 到 {end} 条，共 {total} 条结果",
          pageInfo: "第 {current} 页，共 {total} 页"
        },
        dialog: {
          banTitle: "封禁用户",
          banDescription: "您确定要封禁此用户吗？他们将无法访问应用程序。",
          banSuccess: "用户封禁成功",
          unbanSuccess: "用户解封成功",
          updateRoleSuccess: "用户角色更新成功",
          updateRoleFailed: "用户角色更新失败"
        }
      },
      banDialog: {
        title: "封禁用户",
        description: "您确定要封禁 {userName} 吗？他们将无法访问应用程序。"
      },
      unbanDialog: {
        title: "解封用户",
        description: "您确定要解封 {userName} 吗？他们将重新获得访问权限。"
      },
      form: {
        title: "用户信息",
        description: "请在下方输入用户详细信息",
        labels: {
          name: "姓名",
          email: "邮箱",
          password: "密码",
          confirmPassword: "确认密码",
          role: "角色",
          image: "头像",
          phoneNumber: "手机号",
          emailVerified: "邮箱已验证",
          phoneVerified: "手机已验证",
          banned: "已封禁",
          banReason: "封禁原因"
        },
        placeholders: {
          name: "请输入用户姓名",
          email: "请输入用户邮箱",
          password: "请输入密码（至少8位）",
          confirmPassword: "请确认密码",
          selectRole: "请选择角色",
          image: "https://example.com/avatar.jpg",
          phoneNumber: "请输入手机号",
          banReason: "封禁原因（可选）"
        },
        validation: {
          nameRequired: "姓名不能为空",
          emailRequired: "邮箱不能为空",
          emailInvalid: "请输入有效的邮箱地址",
          passwordRequired: "密码不能为空",
          passwordMinLength: "密码至少需要8位字符",
          passwordMismatch: "两次输入的密码不一致",
          roleRequired: "请选择角色"
        }
      },
      deleteDialog: {
        title: "删除用户",
        description: "您确定要删除此用户吗？此操作无法撤销，将永久删除用户账户和所有相关数据。"
      },
      messages: {
        createSuccess: "用户创建成功",
        updateSuccess: "用户更新成功",
        deleteSuccess: "用户删除成功",
        fetchError: "获取用户信息失败",
        operationFailed: "操作失败",
        deleteError: "删除用户失败"
      }
    },
    orders: {
      title: "订单管理",
      actions: {
        createOrder: "创建订单"
      },
      messages: {
        fetchError: "加载订单失败，请重试。"
      },
      table: {
        noResults: "未找到订单。",
        search: {
          searchBy: "搜索条件...",
          searchPlaceholder: "按{field}搜索...",
          filterByStatus: "按状态筛选",
          allStatus: "所有状态",
          filterByProvider: "支付方式",
          allProviders: "所有支付方式",
          pending: "待支付",
          paid: "已支付",
          failed: "支付失败",
          refunded: "已退款",
          canceled: "已取消",
          stripe: "Stripe",
          wechat: "微信支付",
          creem: "Creem"
        },
        columns: {
          id: "订单ID",
          user: "用户",
          amount: "金额",
          plan: "计划",
          status: "状态",
          provider: "支付方式",
          providerOrderId: "支付平台订单ID",
          createdAt: "创建时间",
          actions: "操作"
        },
        actions: {
          viewOrder: "查看订单",
          refundOrder: "退款",
          openMenu: "打开菜单",
          actions: "操作",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        }
      },
      status: {
        pending: "待支付",
        paid: "已支付",
        failed: "支付失败",
        refunded: "已退款",
        canceled: "已取消"
      }
    },
    subscriptions: {
      title: "订阅管理",
      description: "管理用户订阅和账单",
      actions: {
        createSubscription: "创建订阅"
      },
      messages: {
        fetchError: "加载订阅失败，请重试。"
      },
      table: {
        showing: "显示第 {from} 到 {to} 项，共 {total} 项结果",
        noResults: "未找到订阅。",
        rowsPerPage: "每页行数",
        page: "第",
        of: "页，共",
        view: "查看",
        toggleColumns: "切换列",
        goToFirstPage: "转到第一页",
        goToPreviousPage: "转到上一页", 
        goToNextPage: "转到下一页",
        goToLastPage: "转到最后一页",
        search: {
          searchLabel: "搜索订阅",
          searchField: "搜索字段",
          statusLabel: "状态",
          providerLabel: "提供商",
          search: "搜索",
          clear: "清除",
          allStatuses: "所有状态",
          allProviders: "所有提供商",
          stripe: "Stripe",
          creem: "Creem",
          wechat: "微信支付",
          userEmail: "用户邮箱",
          subscriptionId: "订阅ID",
          userId: "用户ID",
          planId: "计划ID",
          stripeSubscriptionId: "Stripe订阅ID",
          creemSubscriptionId: "Creem订阅ID",
          placeholders: {
            userEmail: "输入用户邮箱...",
            subscriptionId: "输入订阅ID...",
            userId: "输入用户ID...",
            planId: "输入计划ID...",
            stripeSubscriptionId: "输入Stripe订阅ID...",
            creemSubscriptionId: "输入Creem订阅ID...",
            default: "输入搜索词..."
          },
          searchBy: "搜索条件...",
          searchPlaceholder: "按{field}搜索...",
          filterByStatus: "按状态筛选",
          filterByProvider: "按提供商筛选",
          allStatus: "所有状态",
          filterByPaymentType: "支付类型",
          allPaymentTypes: "所有类型",
          active: "活跃",
          canceled: "已取消",
          expired: "已过期",
          trialing: "试用中",
          inactive: "未激活",
          oneTime: "一次性",
          recurring: "循环订阅"
        },
        columns: {
          id: "订阅ID",
          user: "客户",
          plan: "计划",
          status: "状态",
          paymentType: "支付类型",
          provider: "提供商",
          periodStart: "开始时间",
          periodEnd: "结束时间",
          cancelAtPeriodEnd: "将取消",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          metadata: "元数据",
          period: "周期",
          actions: "操作"
        },
        actions: {
          openMenu: "打开菜单",
          actions: "操作",
          viewSubscription: "查看订阅",
          cancelSubscription: "取消订阅",
          clickToCopy: "点击复制"
        },
        sort: {
          ascending: "升序排列",
          descending: "降序排列",
          none: "取消排序"
        }
      },
      status: {
        active: "活跃",
        trialing: "试用中",
        canceled: "已取消",
        cancelled: "已取消",
        expired: "已过期",
        inactive: "未激活"
      },
      paymentType: {
        one_time: "一次性",
        recurring: "循环订阅"
      }
    }
  },
  pricing: {
    metadata: {
      title: "TinyShip - 定价方案",
      description: "按张付费，单张 2 元，购买图片包享受批量折扣。支持微信支付与多渠道安全结算。",
      keywords: "定价, 图片包, 按张计费, 批量折扣, 微信支付, 订阅"
    },
    title: "定价",
    subtitle: "按张计费，量大更优惠",
    description: "单张 2 元，购买 20 张、100 张等图片包可享批量折扣。支付完成后自动按张扣费，支持微信支付等主流通道。",
    cta: "立即开始",
    recommendedBadge: "推荐选择",
    lifetimeBadge: "一次购买，终身使用",
    features: {
      securePayment: {
        title: "多渠道安全支付",
        description: "支持微信支付、Stripe、Creem 等多种企业级安全支付方式"
      },
      flexibleSubscription: {
        title: "灵活计费模式",
        description: "支持单次付费和订阅付费两种模式，满足不同需求"
      },
      globalCoverage: {
        title: "全球支付覆盖",
        description: "多币种和地区支付方式，为全球用户提供便捷支付体验"
      }
    },
    plans: {
      monthly: {
        name: "月度订阅",
        description: "灵活管理，按月付费",
        duration: "月",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持"
        }
      },
      yearly: {
        name: "年度订阅",
        description: "年付更优惠",
        duration: "年",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持",
          "两个月免费": "两个月免费"
        }
      },
      lifetime: {
        name: "终身会员",
        description: "一次付费，永久使用",
        duration: "终身",
        features: {
          "所有高级功能": "所有高级功能",
          "优先支持": "优先支持",
          "终身免费更新": "终身免费更新"
        }
      }
    }
  },
  payment: {
    metadata: {
      success: {
        title: "TinyShip - 支付成功",
        description: "您的支付已成功处理。感谢您的订阅，欢迎使用我们的高级功能。",
        keywords: "支付, 成功, 订阅, 确认, 高级功能"
      },
      cancel: {
        title: "TinyShip - 支付已取消",
        description: "您的支付已被取消。您可以重新尝试支付或联系我们的客服团队获取帮助。",
        keywords: "支付, 取消, 重试, 客服, 订阅"
      }
    },
    result: {
      success: {
        title: "支付成功",
        description: "您的支付已成功处理。",
        actions: {
          viewSubscription: "查看订阅",
          backToHome: "返回首页"
        }
      },
      cancel: {
        title: "支付已取消",
        description: "您的支付已被取消。",
        actions: {
          tryAgain: "重试",
          contactSupport: "联系客服",
          backToHome: "返回首页"
        }
      },
      failed: "支付失败，请重试"
    },
    steps: {
      initiate: "初始化",
      initiateDesc: "准备支付",
      scan: "扫码",
      scanDesc: "请扫描二维码",
      pay: "支付",
      payDesc: "确认支付"
    },
    scanQrCode: "请使用微信扫描二维码完成支付",
    confirmCancel: "您的支付尚未完成，确定要取消吗？",
    orderCanceled: "您的订单已取消"
  },
  subscription: {
    metadata: {
      title: "TinyShip - 我的订阅",
      description: "在您的订阅仪表板中管理订阅计划、查看账单历史和更新付款方式。",
              keywords: "订阅, 账单, 支付, 计划, 管理, 仪表板"
    },
    title: "我的订阅",
    overview: {
      title: "订阅概览",
      planType: "计划类型",
      status: "状态",
      active: "已激活",
      startDate: "开始日期",
      endDate: "结束日期",
      progress: "订阅进度"
    },
    management: {
      title: "订阅管理",
      description: "通过客户门户管理您的订阅、查看账单历史和更新付款方式。",
      manageSubscription: "管理订阅",
      changePlan: "更改计划",
      redirecting: "正在跳转..."
    },
    noSubscription: {
      title: "未找到有效订阅",
      description: "您当前没有活跃的订阅计划。",
      viewPlans: "查看订阅计划"
    }
  },
  dashboard: {
    metadata: {
      title: "TinyShip - 仪表盘",
      description: "在您的个性化仪表盘中管理账户、订阅和个人资料设置。",
              keywords: "仪表盘, 账户, 个人资料, 订阅, 设置, 管理"
    },
    title: "仪表盘",
    description: "管理您的账户和订阅",
    profile: {
      title: "个人信息",
      noNameSet: "未设置姓名",
      role: "角色:",
      emailVerified: "邮箱已验证",
      editProfile: "编辑个人资料",
      updateProfile: "更新个人资料",
      cancel: "取消",
      form: {
        labels: {
          name: "姓名",
          email: "邮箱地址",
          image: "头像图片链接"
        },
        placeholders: {
          name: "请输入您的姓名",
          email: "邮箱地址",
          image: "https://example.com/your-image.jpg"
        },
        emailReadonly: "邮箱地址无法修改",
        imageDescription: "可选：输入您的头像图片链接"
      },
      updateSuccess: "个人资料更新成功",
      updateError: "更新个人资料失败，请重试"
    },
    subscription: {
      title: "订阅状态",
      status: {
        lifetime: "终身会员",
        active: "有效",
        canceled: "已取消",
        cancelAtPeriodEnd: "期末取消",
        pastDue: "逾期",
        unknown: "未知",
        noSubscription: "无订阅"
      },
      paymentType: {
        recurring: "循环订阅",
        oneTime: "一次性"
      },
      lifetimeAccess: "您拥有终身访问权限",
      expires: "到期时间:",
      cancelingNote: "您的订阅将不会续订，并将在以下时间结束:",
      noActiveSubscription: "您当前没有有效的订阅",
      manageSubscription: "管理订阅",
      viewPlans: "查看套餐"
    },
    account: {
      title: "账户信息",
      memberSince: "注册时间",
      phoneNumber: "手机号码"
    },
    orders: {
      title: "订单历史",
      status: {
        pending: "待支付",
        paid: "已支付",
        failed: "支付失败",
        refunded: "已退款",
        canceled: "已取消"
      },
      provider: {
        stripe: "Stripe",
        wechat: "微信支付",
        creem: "Creem"
      },
      noOrders: "没有找到订单",
      noOrdersDescription: "您还没有下过任何订单",
      viewAllOrders: "查看所有订单",
      orderDetails: {
        orderId: "订单ID",
        amount: "金额",
        plan: "计划",
        status: "状态",
        provider: "支付方式",
        createdAt: "创建时间"
      },
      recent: {
        title: "最近订单",
        showingRecent: "显示最近 {count} 个订单"
      },
      page: {
        title: "所有订单",
        description: "查看和管理您的所有订单",
        backToDashboard: "返回仪表盘",
        totalOrders: "共 {count} 个订单"
      }
    },
    linkedAccounts: {
      title: "关联账户",
      connected: "已连接",
      connectedAt: "关联时间:",
      noLinkedAccounts: "暂无关联账户",
      providers: {
        credentials: "邮箱密码",
        google: "Google",
        github: "GitHub",
        facebook: "Facebook",
        apple: "Apple",
        discord: "Discord",
        wechat: "微信",
        phone: "手机号"
      }
    },
    tabs: {
      profile: {
        title: "个人资料",
        description: "管理您的个人信息和头像"
      },
      account: {
        title: "账户管理",
        description: "密码修改、关联账户和账户安全"
      },
      security: {
        title: "安全设置",
        description: "密码和安全设置"
      },
      subscription: {
        description: "管理您的订阅计划和付费功能"
      },
      orders: {
        description: "查看您的订单历史和交易记录"
      },
      content: {
        profile: {
          title: "个人资料",
          subtitle: "这是您在网站上向其他人展示的信息。",
          username: {
            label: "用户名",
            value: "shadcn",
            description: "这是您的公开显示名称。可以是您的真实姓名或昵称。您只能每30天更改一次。"
          },
          email: {
            label: "邮箱",
            placeholder: "选择要显示的已验证邮箱",
            description: "您可以在邮箱设置中管理已验证的邮箱地址。"
          }
        },
        account: {
          title: "账户设置",
          subtitle: "管理您的账户设置和偏好。",
          placeholder: "账户设置内容..."
        },
        security: {
          title: "安全设置",
          subtitle: "管理您的密码和安全设置。",
          placeholder: "安全设置内容..."
        }
      }
    },
    quickActions: {
      title: "快速操作",
      editProfile: "编辑资料",
      accountSettings: "账户设置",
      subscriptionDetails: "订阅详情",
      getSupport: "获取帮助",
      viewDocumentation: "查看文档"
    },
    accountManagement: {
      title: "账户管理",
      changePassword: {
        title: "更改密码",
        description: "更新您的账户密码",
        oauthDescription: "社交登录账户无法更改密码",
        button: "更改密码",
        dialogDescription: "请输入您当前的密码并选择新密码",
        form: {
          currentPassword: "当前密码",
          currentPasswordPlaceholder: "请输入当前密码",
          newPassword: "新密码",
          newPasswordPlaceholder: "请输入新密码（至少8个字符）",
          confirmPassword: "确认新密码",
          confirmPasswordPlaceholder: "请再次输入新密码",
          cancel: "取消",
          submit: "更新密码"
        },
        success: "密码更新成功",
        errors: {
          required: "请填写所有必填字段",
          mismatch: "两次输入的新密码不一致",
          minLength: "密码长度至少为8个字符",
          failed: "密码更新失败，请重试"
        }
      },
      deleteAccount: {
        title: "删除账户",
        description: "永久删除您的账户及所有相关数据",
        button: "删除账户",
        confirmTitle: "删除账户",
        confirmDescription: "您确定要删除您的账户吗？",
        warning: "⚠️ 此操作无法撤销",
        consequences: {
          data: "您的所有个人数据将被永久删除",
          subscriptions: "活跃订阅将被取消",
          access: "您将失去所有高级功能的访问权限"
        },
        form: {
          cancel: "取消",
          confirm: "是的，删除我的账户"
        },
        success: "账户删除成功",
        errors: {
          failed: "删除账户失败，请重试"
        }
      }
    },
    roles: {
      admin: "管理员",
      user: "普通用户"
    }
  },
  premiumFeatures: {
    metadata: {
      title: "TinyShip - 高级功能",
      description: "探索您的订阅包含的所有高级功能。访问高级工具、AI 助手和增强功能。",
      keywords: "高级功能, 功能, 高级, 工具, 订阅, 权益, 增强"
    },
    title: "高级功能",
    description: "感谢您的订阅！以下是您现在可以使用的所有高级功能。",
    loading: "加载中...",
    subscription: {
      title: "您的订阅",
      description: "当前订阅状态和详细信息",
      status: "订阅状态",
      type: "订阅类型",
      expiresAt: "到期时间",
      active: "已激活",
      inactive: "未激活",
      lifetime: "终身会员",
      recurring: "周期性订阅"
    },
    badges: {
      lifetime: "终身会员"
    },
    demoNotice: {
      title: "🎯 SaaS 模板演示页面",
      description: "这是一个用于测试路由保护的演示页面。只有付费用户才能访问此页面，展示了如何在您的 SaaS 应用中实现订阅级别的访问控制。"
    },
    features: {
      userManagement: {
        title: "高级用户管理",
        description: "完整的用户档案管理和自定义设置"
      },
      aiAssistant: {
        title: "AI 智能助手",
        description: "先进的人工智能功能，提升工作效率"
      },
      documentProcessing: {
        title: "无限文档处理",
        description: "处理任意数量和大小的文档文件"
      },
      dataAnalytics: {
        title: "详细数据分析",
        description: "深入的数据分析和可视化报表"
      }
    },
    actions: {
      accessFeature: "访问功能"
    }
  },
  ai: {
    metadata: {
      title: "LoomAI - AI 模特图生成器",
      description: "一句话描述即可生成写真级服装模特图，帮助品牌、工厂与买手跳过拍摄环节，直接验证造型。",
      keywords: "AI 模特, 服装生图, Lookbook 生成, 文生图, 时尚 AI"
    },
    nanoBanana: {
      title: "Nano Banana 2 影像实验室",
      subtitle: "快速测试 Nano Banana 2（Gemini 3）的文生图、图生图与编辑能力，适合电商模特、横幅海报或简单换装。",
      promptTitle: "创意提示",
      promptDescription: "描述你想要的画面。上传参考图即可切换到图生图/编辑模式。",
      promptLabel: "提示词",
      promptPlaceholder: "例：东京夜景街头的街潮模特，霓虹氛围光，3:4 竖版",
      promptHelper: "建议简洁：主体 + 造型 + 光线 + 氛围。",
      modelLabel: "模型",
      modelHelper: "可切换极速的 Z Image Turbo、支持图生图/编辑的 Nano Banana 2 Lite，或更高质量的 Gemini 3 Pro（预览版）。",
      sizeLabel: "画幅比例",
      qualityLabel: "清晰度",
      qualityHelper: "4K 会消耗更多配额，2K 性价比最佳。Z Image Turbo 不支持清晰度参数，仅使用画幅。",
      models: {
        "z-image-turbo": "Z Image Turbo（极速）",
        "nano-banana-2-lite": "Nano Banana 2 Lite（图生图/编辑）",
        "gemini-3-pro-image-preview": "Gemini 3 Pro Image Preview（高质量预览）",
      },
      referencesTitle: "参考图",
      referencesDescription: "可选：拖拽上传文件用于图生图或编辑。",
      referencesCta: "拖拽或点击上传",
      referencesHelper: "JPG/PNG/WebP • 最多 5 张 • 单张 ≤10MB",
      referenceHint: "第 1 张参考图权重最高。",
      uploadCta: "从本地上传",
      uploading: "上传中…",
      statusTitle: "异步任务状态",
      statusDescription: "提交后轮询进度。链接有效期 24 小时。",
      resultTitle: "输出预览",
      resultDescription: "展示返回列表中的第一个链接。",
      errorState: "生成失败，可以调整提示词重试。",
      generateCta: "使用 Nano Banana 2 生成",
      generating: "提交中…",
      resetCta: "重置",
      downloadCta: "下载",
      downloading: "下载中…",
      badges: {
        model: "模型：Nano Banana 2 (Gemini 3)",
        async: "异步返回任务 ID",
        expiry: "结果链接有效期 24 小时",
      },
      scenariosTitle: "快速场景",
      scenarios: [
        {
          title: "电商棚拍（文生图）",
          prompt: "中性背景的女模特，穿短款牛仔夹克和百褶中裙，柔和棚灯，3:4 竖构图。",
        },
        {
          title: "街拍 Lookbook",
          prompt: "东京小巷夜景的男模特，宽松飞行员夹克+图案 T 恤，霓虹侧光，3:4。",
        },
        {
          title: "静物转上身（图生图）",
          prompt: "将参考的静物平铺/白底图转为模特上身，布料与 LOGO 保持一致，极简棚景。",
        },
        {
          title: "重光影修图",
          prompt: "把参考人像重打暖色夕阳光，保持脸部和服装完全不变，轻微胶片颗粒。",
        },
      ],
      checklistTitle: "检查清单",
      checklistDescription: "确认输入与要跑的模式匹配。",
      checklistItems: {
        references: "需要图生图/编辑时请上传参考图。",
        prompt: "主体 + 造型 + 光线 + 氛围，越具体越好。",
        quality: "选择 1K/2K/4K，测试推荐 2K。",
        model: "选择合适模型：Turbo 追求速度，Nano Lite 支持图生图/编辑，Gemini 质量更高。",
      },
      linkNotice: "结果链接 24 小时过期，需留存请及时下载。",
      toasts: {
        requiredPrompt: "请输入提示词。",
        invalidType: "仅支持图片文件。",
        fileTooLarge: "图片需小于 10MB。",
        maxFiles: "最多上传 5 张图片。",
        error: "任务提交失败，请重试。",
      },
    },
    promptExtractor: {
      title: "图片提示词拆解",
      subtitle: "上传参考图片，使用 GPT-5 Nano 拆解出可直接复用的提示词。",
      uploadTitle: "参考图片",
      uploadDescription: "拖拽或上传一张 JPG/PNG/WebP（≤10MB），后台会转换为安全的 Data URL 调用 APIMart。",
      uploadLimit: "单张图片 · JPG/PNG/WebP · ≤10MB",
      dropLabel: "拖拽到这里或点击上传",
      removeLabel: "移除图片",
      helper: "输出包含主体、服装/材质、背景、光线、镜头语言与氛围，用逗号分隔。",
      hintsLabel: "可选补充要求",
      hintsPlaceholder: "例如：用英文输出，强调镜头和色调",
      cta: "生成提示词",
      analyzing: "解析中…",
      resultTitle: "生成的提示词",
      resultDescription: "复制后直接用于图生图或扩写任务。",
      copy: "复制提示词",
      copied: "已复制",
      usageLabel: "Token 消耗",
      usageTokens: {
        prompt: "输入 Tokens",
        completion: "输出 Tokens",
        total: "总 Tokens",
      },
      badges: {
        model: "模型：gpt-5-nano",
        endpoint: "接口：/v1/responses",
        vision: "支持视觉",
      },
      statuses: {
        idle: "等待上传图片",
        analyzing: "分析图片中…",
        success: "提示词已生成",
        error: "生成失败",
      },
      toasts: {
        missingImage: "请先上传图片。",
        invalidType: "仅支持 JPG、PNG、WebP。",
        fileTooLarge: "图片需小于 10MB。",
        error: "提示词生成失败，请稍后再试。",
        success: "提示词已生成。",
      },
    },
    generator: {
      title: "描述款式，LoomAI 立即呈现模特",
      subtitle: "默认用 Z Image Turbo 极速文生图；若上传参考图，自动切换 Nano Banana 2 (Gemini 3) 做融合，理解面料、姿势与批发物料规范。",
      badges: {
        model: "默认 Z Image Turbo · 参考图用 Nano Banana 2",
        turnaround: "平均 30 秒内出图",
        usage: "图片链接保留 24 小时"
      },
      form: {
        title: "填写视觉 Brief",
        description: "描述廓形、面料、灯光与想传达给买家的氛围。",
        promptLabel: "创意描述",
        promptPlaceholder: "如：极简浅驼色亚麻套装，高挑亚裔女模，柔和自然光，3:4 构图",
        promptHelper: "建议包含：款式/材质 + 模特特征 + 场景灯光 + 构图需求。",
        sizeLabel: "画幅比例",
        sizePlaceholder: "选择比例",
        sizeHelper: "3:4 / 9:16 适合 Lookbook/PDP 竖图，16:9 用于横幅与陈列屏幕。",
        qualityLabel: "面料细节",
        qualityHelper: "系统锁定服装对齐点，褶皱、线迹与辅料都能保持真实。",
        ratioLabels: {
          auto: "自动适配",
          "3:4": "3:4 画册竖图",
          "4:3": "4:3 目录横图",
          "1:1": "1:1 社媒/PDP 方图",
          "9:16": "9:16 移动端封面",
          "16:9": "16:9 活动横幅",
          "2:3": "2:3 时装大片",
          "3:2": "3:2 杂志裁切",
          "4:5": "4:5 海报竖图",
          "5:4": "5:4 画廊装裱",
          "21:9": "21:9 影院长幅"
        },
        submit: "生成模特图",
        generating: "生成中…",
        newRender: "重新开始",
        validation: {
          requiredPrompt: "请先描述想要生成的画面。"
        }
      },
      fusion: {
        title: "参考图融合",
        description: "上传想要融合的参考图：照片 1 固定模特身份，照片 2 完整复制衣服。",
        badge: "图像融合",
        helper: "拖入 JPG/PNG/WebP，最多 5 张，每张 ≤10MB。",
        limit: "最多 5 张参考图 • JPG/PNG/WebP • 单张 ≤10MB。",
        emptyTitle: "拖拽或点击上传参考图",
        emptyDescription: "照片 1 = 模特参考，照片 2 = 衣服参考，额外图片可补充细节或背景。",
        selectFiles: "选择图片",
        addMore: "还能添加 {count} 张",
        orderHint: "第一张锁定人物，第二张复制衣服版型与颜色。",
        photoLabel: "照片 {index}",
        previewAlt: "参考图 {index}",
        removeLabel: "移除图片",
        directiveTitle: "默认附加指令",
        defaultPrompt: "请把模特参考图（照片 1）中的人物，穿上衣服参考图（照片 2）中的确切服装，不做其他改动。务必保持面部、性别、姿势、机位完全一致，同时 1:1 复制衣服的颜色、面料、花纹、辅料与结构细节。",
        errors: {
          maxFiles: "最多只可上传 5 张图片。",
          invalidType: "仅支持图片格式。",
          fileTooLarge: "参考图需小于 10MB。"
        }
      },
      sectionNav: {
        title: "页面导航",
        fusion: "参考图融合",
        prompt: "提示词输入",
        status: "状态面板",
        result: "生成结果"
      },
      status: {
        idle: "待生成",
        creating: "已提交任务",
        polling: "渲染中",
        completed: "生成完成",
        failed: "生成失败"
      },
      statusCard: {
        title: "任务状态",
        description: "我们会在 Evolink 创建异步任务并持续轮询直至完成。",
        eta: "平均耗时：{seconds}",
        elapsed: "已用时：{time}",
        progress: "进度 {value}",
        lastPromptTitle: "上一次的 Prompt"
      },
      samples: {
        title: "一键提示词",
        description: "直接点击即可填充，可在此基础上替换面料、姿态或场景。",
        items: [
          "运动感亚裔女模演绎牛仔两件套，3:4 构图，电影感轮廓光",
          "深肤高挑男模穿高级灰西装，极简棚拍，4:3 Lookbook",
          "童装透明 PVC 雨衣，开心的儿童模特，9:16 纵向封面",
          "机能运动套装，日落天台街头氛围，2:3 运动大片"
        ]
      },
      result: {
        title: "最新输出",
        description: "在线预览或把链接发给团队即可确认。",
        alt: "AI 生成的服装模特图片",
        download: "下载图片",
        newPrompt: "继续生成",
        emptyTitle: "等待你的创意",
        emptyDescription: "在上方输入款式与场景，我们就会把模特呈现在这里。"
      },
      toasts: {
        completed: "模特图已生成。",
        error: "生成失败，请稍后重试。"
      }
    },
    fabricDesigner: {
      hero: {
        badge: "面料设计器",
        title: "一张模特照切换丝绸、牛仔、针织多版材",
        subtitle: "上传模特基准图，选中面料与印花，LoomAI 会在保留人物、姿态与背景的前提下模拟真实材质。",
        highlights: ["丝绸/牛仔/针织预设", "印花与纹理控制", "同款式多材质快预览"]
      },
      featureCards: {
        materialSwap: {
          title: "多材质衣橱",
          description: "一次排队丝绸、牛仔、针织或自定义面料，秒级回应买家与供应链。"
        },
        textureLab: {
          title: "纹理/印花实验室",
          description: "控制光泽、织纹密度与循环比例，提示词即可生成独特图案。"
        },
        previewDeck: {
          title: "一致性对比",
          description: "输出始终沿用上传的模特与姿态，方便对比不同材质效果。"
        }
      },
      upload: {
        title: "上传参考图",
        description: "使用打样室或展厅拍摄的模特上身图即可。",
        helper: "衣身完整且光线均匀效果最佳。",
        dragLabel: "拖拽图片或点击上传",
        replace: "选择图片",
        clear: "移除图片",
        limit: "仅支持 JPG/PNG，大小不超过 10MB，背景越干净越好。",
        previewAlt: "上传的模特参考图"
      },
      fabricsSection: {
        title: "面料选择",
        subtitle: "勾选要预览的材质，我们会依次生成。",
        batchHint: "多选会排队顺序生成"
      },
      fabrics: {
        silk: {
          title: "丝绸高光",
          description: "拟真绸缎/欧根纱光泽与流动褶皱。"
        },
        denim: {
          title: "牛仔斜纹",
          description: "保留靛蓝纹理、走线与挺括结构。"
        },
        knit: {
          title: "针织肌理",
          description: "罗纹、毛衣、针织纹理呈现柔软纱线。"
        },
        custom: {
          title: "自定义面料",
          description: "输入特殊材质、工艺或面料编号。"
        }
      },
      customFabric: {
        label: "自定义面料名称",
        placeholder: "例如：金属感提花",
        helper: "会显示在提示词与图库标签中。"
      },
      prints: {
        title: "印花 / 纹理指令",
        description: "可选。描述循环图案、刺绣或织纹方向。",
        placeholder: "例如：低饱和度花卉提花，4cm 循环",
        scaleLabel: "纹理比例",
        scaleHelper: "数值越小越密集，越大越疏。"
      },
      controls: {
        textureStrengthLabel: "材质保真度",
        textureStrengthHelper: "混合权重：{value}",
        lockModel: "锁定人物与姿势",
        lockModelHelper: "保持脸部、身材与镜头完全一致。",
        preserveBackground: "保持背景环境",
        preserveBackgroundHelper: "默认不改背景，如需微调可关闭。",
        advancedNotesLabel: "额外指令",
        advancedNotesPlaceholder: "可写灯光、工艺或买家备注…"
      },
      queue: {
        title: "待生成队列",
        description: "会按顺序依次渲染。",
        queueCount: "剩余 {count} 个面料",
        empty: "请至少勾选一个面料预设",
        stop: "停止队列"
      },
      generator: {
        actionSingle: "生成面料预览",
        actionBatch: "生成所有勾选面料",
        generating: "正在提交..."
      },
      status: {
        idle: "等待上传",
        creating: "上传参考图",
        polling: "模拟材质中",
        completed: "预览已就绪",
        failed: "生成失败"
      },
      statusCard: {
        title: "渲染状态",
        description: "后台调用 Evolink 任务并实时同步。",
        eta: "平均剩余 {seconds}",
        elapsed: "已耗时 {time}",
        progress: "进度 {value}",
        activeFabric: "当前材质：{fabric}",
        queueDepth: "还有 {count} 个排队"
      },
      result: {
        title: "最新面料预览",
        description: "可直接下载发送给供应链或买手。",
        alt: "面料替换效果图",
        download: "下载 PNG",
        emptyTitle: "还没有生成记录",
        emptyDescription: "上传模特图并点击生成后即可预览。"
      },
      gallery: {
        title: "面料对比面板",
        subtitle: "所有完成的材质会自动归档，方便比对与审批。",
        emptyTitle: "暂无面料记录",
        emptyDescription: "每次生成成功都会自动记录在这里。",
        generatedAt: "生成时间 {time}",
        download: "下载"
      },
      toasts: {
        imageRequired: "请先上传模特参考图。",
        fabricRequired: "请至少选择一个面料。",
        customFabricRequired: "请填写自定义面料名称。",
        queueStarted: "已排队 {count} 个面料。",
        queueCleared: "已停止队列并结束当前跟踪。",
        completed: "面料预览生成完成。",
        error: "面料渲染失败，请稍后重试。",
        fileTooLarge: "图片需小于 10MB。",
        invalidFileType: "仅支持图片格式。"
      }
    },
    tryOn: {
      hero: {
        badge: "虚拟试衣",
        title: "把街拍或 Lookbook 的衣服，直接穿到你的模特身上",
        subtitle: "上传模特参考图（图 1）和衣服参考图（图 2），先上传到 OSS，再用 Nano Banana 2 (Gemini 3) 把图 1 的人物穿上图 2 的衣服。",
        highlights: ["图 1 模特 + 图 2 衣服", "OSS 上传 + 异步任务", "Nano Banana 2 引擎"]
      },
      uploadSection: {
        title: "上传参考素材",
        description: "需要模特参考图与衣服参考图各一张。",
        limit: "JPG/PNG/WebP，单张不超过 10MB，光线越清晰越好。",
        replace: "选择文件",
        clear: "清除图片"
      },
      modelUpload: {
        title: "模特参考图",
        description: "正面或侧面上身照皆可，保持想要的姿势。",
        helper: "保留你想要的姿态"
      },
      garmentUpload: {
        title: "衣服参考图",
        description: "可使用平铺图、模特上身、街拍或任何对标款。",
        helper: "尽量聚焦衣服区域"
      },
      simplePrompt: "让图 1 的人物穿上图 2 的衣服，保持身份和姿势不变。",
      controls: {
        backgroundLabel: "背景处理",
        backgroundPlaceholder: "选择背景策略",
        backgroundOptions: [
          { value: "preserve", label: "保持背景", helper: "不改动任何场景元素。" },
          { value: "studio", label: "统一棚拍", helper: "允许轻微清理成干净棚拍背景。" },
          { value: "street", label: "街拍氛围", helper: "允许做轻微生活化延展。" },
          { value: "custom", label: "自适应", helper: "根据衣服气质微调背景。" }
        ],
        fitLabel: "版型贴合度",
        fitHelper: "数值越低越宽松，越高越贴体。",
        accessoriesLabel: "保留配饰/发妆",
        accessoriesHelper: "勾选后保持原有首饰、发型、妆容与道具。",
        notesLabel: "额外指令",
        notesPlaceholder: "如：保留同款腰带、柔一点光线、肩包勿删…"
      },
      actions: {
        cta: "开始换装",
        generating: "正在换装…",
        reset: "重置"
      },
      status: {
        idle: "等待上传",
        creating: "上传参考图",
        polling: "套用衣服中",
        completed: "试衣完成",
        failed: "生成失败"
      },
      statusCard: {
        title: "试衣状态",
        description: "我们在 Evolink 创建任务并实时同步进度。",
        eta: "平均耗时 {seconds}",
        elapsed: "已耗时 {time}",
        progress: "进度 {value}"
      },
      result: {
        title: "最新试衣效果",
        description: "下载后可直接发给供应链、买手或陈列团队。",
        alt: "虚拟试衣效果图",
        download: "下载图片",
        emptyTitle: "暂未生成",
        emptyDescription: "上传两张参考图并点击开始换装，即可在此预览。"
      },
      history: {
        title: "试衣记录",
        subtitle: "每次换装都会自动保存，方便比对与复盘。",
        emptyTitle: "还没有换装记录",
        emptyDescription: "完成一次试衣后就会出现在这里。",
        generatedAt: "生成时间 {time}",
        download: "下载",
        defaultLabel: "换装结果"
      },
      toasts: {
        modelRequired: "请先上传模特参考图。",
        garmentRequired: "请上传想要套用的衣服参考图。",
        invalidFileType: "仅支持图片格式。",
        fileTooLarge: "图片需小于 10MB。",
        error: "虚拟试衣失败，请稍后重试。",
        completed: "试衣已完成。"
      }
    }
  },
  home: {
    metadata: {
      title: "LoomAI - 服装 AI 图片与面料设计工作站",
      description: "以创意文生图、面料设计、虚拟模特和场景化营销为核心，一站式生成女装、男装、童装的灵感图、面料纹理和多视角产品素材。",
      keywords: "AI 服装图片, 文生图, 面料设计, 虚拟模特, 场景化营销, 产品多视角"
    },
    hero: {
      title: "服装 AI 图片一站式生成与面料设计",
      titlePrefix: "服装 AI 图片",
      titleHighlight: "一站式",
      titleSuffix: "生成与面料设计",
      subtitle: "输入提示词生成灵感图，切换面料材质预览、虚拟模特与场景营销图，细节/平铺/模特全套素材一次拿到。",
      buttons: {
        purchase: "预约演示",
        demo: "查看案例"
      },
      features: {
        lifetime: "输入“2024春季女装连衣裙，碎花元素，法式风格”即可生成参考图",
        earlyBird: "同一款式一键切换丝绸、牛仔、针织效果图"
      }
    },
    features: {
      title: "为你要做的功能写好文案",
      subtitle: "创意文生图、面料设计、虚拟模特、场景化营销与多视角输出都在这里。",
      items: [
        {
          title: "创意文生图",
          description: "输入“2024 春季女装连衣裙，碎花元素，法式风格”，自动生成构图、版型与色感参考。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "面料设计器",
          description: "同一款式切换丝绸、牛仔、针织等材质，保留廓形，输出多版材质效果图。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "纹理与印花生成",
          description: "生成各种面料纹理和印花图案，智能校正循环比例、光泽度与纹理方向。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "虚拟模特生成",
          description: "多肤色、多身材、多年龄段的虚拟模特库，匹配品牌目标客群。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "场景化营销图片",
          description: "咖啡厅、街头、办公室、度假海滩等模板，秒级生成营销海报与广告图。",
          className: "col-span-2 row-span-1"
        },
        {
          title: "多视角产品图",
          description: "细节图、平铺图、模特图一键导出，批发与电商都能直接使用。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "品牌风格锁定",
          description: "固定品牌光线、色盘与镜头语言，批量输出保持统一调性。",
          className: "col-span-1 row-span-1"
        },
        {
          title: "审批与版本留痕",
          description: "版本对比、批注与权限控制，让设计、工厂、买手保持信息同步。",
          className: "col-span-1 row-span-1"
        }
      ],
      techStack: {
        title: "为时尚图像而生的技术栈",
        items: [
          "提示词到系列构图生成",
          "面料材质融合引擎",
          "印花生成与排版校正",
          "虚拟模特生成与调优",
          "场景化光线与镜头模板库",
          "多视角导出与批处理流水线",
          "安全素材库与 API 连接器"
        ]
      }
    },
    applicationFeatures: {
      title: "把创意、面料、模特、场景放进一个工作流",
      subtitle: "每个模块都对应你想做的功能，方便演示、内测与迭代。",
      items: [
        {
          title: "创意文生图工作台",
          subtitle: "从提示词到系列灵感图",
          description: "输入提示词与风格偏好，自动生成多版本灵感图与构图建议，适配品牌色盘与镜头语言，供团队快速挑选。",
          highlights: [
            "提示词 + 品牌风格锁定",
            "多版本同时生成与对比",
            "自动给出姿势/光线/构图建议",
            "灵感库与审批留痕"
          ],
          imageTitle: "创意工作台"
        },
        {
          title: "面料设计与材质库",
          subtitle: "一款式多材质快速预览",
          description: "在同一款式上切换丝绸、牛仔、针织等材质，生成纹理与印花效果图，保存参数、批注与版本供后续复用。",
          highlights: [
            "丝绸/牛仔/针织等光泽纹理匹配",
            "印花与纹理生成，循环比例校正",
            "同版型材质一键切换与批量出图",
            "保存面料规格、批注与版本"
          ],
          imageTitle: "面料设计器"
        },
        {
          title: "虚拟模特与场景营销",
          subtitle: "适配人群与销售渠道",
          description: "选择肤色、身材、年龄与妆发风格，搭配咖啡厅、街头、办公室、度假海滩等场景模板，同时输出细节图、平铺图与模特图。",
          highlights: [
            "肤色/身材/年龄维度可调",
            "场景模板：咖啡厅/街头/办公室/海滩",
            "细节/平铺/上身视角批量导出",
            "合规海报与买手稿一键生成"
          ],
          imageTitle: "模特与场景"
        }
      ]
    },
    roadmap: {
      title: "产品路线图",
      subtitle: "围绕文生图、面料、模特、场景和多视角导出持续迭代。",
      items: [
        {
          title: "创意文生图 1.0",
          description: "提示词模板、品牌风格锁定与多版本灵感生成，快速产出可对比的系列参考。",
          timeline: "2024 Q4",
          status: "in-progress",
          statusText: "开发中",
          features: ["提示词模板与引导词", "品牌光线/色盘锁定", "多版本并行生成"]
        },
        {
          title: "面料设计器",
          description: "在同一款式切换丝绸、牛仔、针织等材质，生成纹理与印花效果并保存参数。",
          timeline: "2025 Q1",
          status: "planned",
          statusText: "计划中",
          features: ["丝绸/牛仔/针织材质切换", "纹理与印花生成", "面料库与参数保存"]
        },
        {
          title: "虚拟模特生成",
          description: "多肤色、多身材、多年龄的虚拟模特库，搭配姿势与光线预设。",
          timeline: "2025 Q1",
          status: "planned",
          statusText: "计划中",
          features: ["肤色/身材/年龄调节", "姿势与光线预设", "品牌妆发风格包"]
        },
        {
          title: "场景化营销模板",
          description: "咖啡厅、街头、办公室、度假海滩等场景模板，直接生成海报与广告图。",
          timeline: "2025 Q2",
          status: "planned",
          statusText: "计划中",
          features: ["多场景模板库", "广告/海报比例适配", "批量导出渠道尺寸"]
        },
        {
          title: "多视角产品图流水线",
          description: "细节图、平铺图、模特图自动化输出，附带抠图与标注。",
          timeline: "2025 Q2",
          status: "planned",
          statusText: "计划中",
          features: ["细节/平铺/模特套图", "自动抠图与标注", "PSD/PNG/WebP 导出"]
        },
        {
          title: "协同与审批工作区",
          description: "对比版本、批注留痕与角色权限，后续对接 PLM/ERP/DAM。",
          timeline: "2025 Q3",
          status: "planned",
          statusText: "计划中",
          features: ["版本对比与批注", "角色权限与审计", "PLM/ERP/DAM 连接器"]
        }
      ],
      footer: "路线图每月更新，欢迎申请新模块内测。"
    },
    stats: {
      title: "专为服装企业打造",
      items: [
        {
          value: "600",
          suffix: "+",
          label: "合作品牌用 AI 打样"
        },
        {
          value: "80",
          suffix: "+",
          label: "已接入工厂与供应商"
        },
        {
          value: "25000",
          suffix: "+",
          label: "每周交付的 AI 渲染图"
        },
        {
          value: "48",
          suffix: "h",
          label: "平均缩短的单个系列交付时间"
        }
      ]
    },
    testimonials: {
      title: "时尚团队的共同选择",
      items: [
        {
          quote: "我们把 70% 的样衣拍摄换成了 AI 图，买家仍能拿到完整 Lookbook，但提前了两周下单。",
          author: "陈莉娜",
          role: "NovaWear 商品副总裁"
        },
        {
          quote: "工厂终于跟品牌看到同一份需求，批注和素材都在一个时间线里，沟通成本下降了一半。",
          author: "Marco Ruiz",
          role: "Atelier Sourcing 首席运营官"
        },
        {
          quote: "多渠道适配以前要几天，现在一夜之间就能交付 14 个市场的合规图片。",
          author: "Emily Hart",
          role: "Loom Collective 数字批发负责人"
        }
      ]
    },
    finalCta: {
      title: "想一起打磨这些功能吗？",
      subtitle: "如果你也想要创意文生图、面料设计、虚拟模特和场景化营销图片，欢迎预约演示或申请内测。",
      buttons: {
        purchase: "预约演示",
        demo: "申请内测"
      }
    },
    footer: {
      copyright: "© {year} LoomAI. All rights reserved.",
      description: "LoomAI — AI 时尚影像基础设施"
    },
    common: {
      demoInterface: "AI 图片工作台预览",
      techArchitecture: "面向服装供应链的企业级安全架构",
      learnMore: "了解详情"
    }
  },
  validators: {
    user: {
      name: {
        minLength: "姓名至少需要{min}个字符",
        maxLength: "姓名不能超过{max}个字符"
      },
      email: {
        invalid: "请输入有效的邮箱地址"
      },
      image: {
        invalidUrl: "请输入有效的链接地址"
      },
      password: {
        minLength: "密码至少需要{min}个字符",
        maxLength: "密码不能超过{max}个字符",
        mismatch: "两次输入的密码不一致"
      },
      countryCode: {
        required: "请选择国家/地区"
      },
      phoneNumber: {
        required: "请输入手机号",
        invalid: "手机号格式不正确"
      },
      verificationCode: {
        invalidLength: "验证码必须是{length}位数字"
      },
      id: {
        required: "用户ID不能为空"
      },
      currentPassword: {
        required: "请输入当前密码"
      },
      confirmPassword: {
        required: "请确认密码"
      },
      deleteAccount: {
        confirmRequired: "您必须确认删除账户"
      }
    }
  },
  countries: {
    china: "中国",
    usa: "美国", 
    uk: "英国",
    japan: "日本",
    korea: "韩国",
    singapore: "新加坡",
    hongkong: "香港",
    macau: "澳门",
    australia: "澳大利亚",
    france: "法国",
    germany: "德国",
    india: "印度",
    malaysia: "马来西亚",
    thailand: "泰国"
  },
  header: {
    navigation: {
      menu: "功能",
      ai: "AI 模特生成",
      fabric: "面料设计",
      tryOn: "虚拟试衣",
      nano: "Nano 实验室",
      promptExtractor: "图片提示词拆解",
      premiumFeatures: "高级会员功能",
      pricing: "定价"
    },
    auth: {
      signIn: "登录",
      getStarted: "开始使用",
      signOut: "退出登录"
    },
    userMenu: {
      dashboard: "控制台",
      profile: "个人资料",
      settings: "设置",
      personalSettings: "个人设置",
      adminPanel: "管理后台"
    },
    language: {
      switchLanguage: "切换语言",
      english: "English",
      chinese: "中文"
    },
    mobile: {
      themeSettings: "主题设置",
      languageSelection: "语言选择"
    }
  }
} as const; 
