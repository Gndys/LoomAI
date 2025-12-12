<script setup lang="ts">
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const localePath = useLocalePath()

interface Order {
  id: string
  amount: string
  currency: string
  planId: string
  status: string
  provider: string
  providerOrderId?: string | null
  metadata?: any
  createdAt: string | Date
  updatedAt?: string | Date
}

const ordersData = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/**
 * Fetch orders data from API
 */
const fetchOrdersData = async () => {
  try {
    const response: any = await $fetch('/api/orders')
    ordersData.value = response.orders || []
  } catch (err) {
    console.error('Failed to fetch orders data', err)
    error.value = 'Failed to fetch orders'
  } finally {
    loading.value = false
  }
}

/**
 * Format date according to user locale
 * @param dateString - Date string or Date object
 * @returns Formatted date string
 */
const formatDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const currentLocale = locale.value
  return date.toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format amount with currency symbol
 * @param amount - Amount string
 * @param currency - Currency code
 * @returns Formatted amount string
 */
const formatAmount = (amount: string, currency: string) => {
  const numAmount = parseFloat(amount)
  return `${currency === 'CNY' ? '¥' : '$'}${numAmount.toLocaleString()}`
}

/**
 * Get plan display name
 * @param planId - Plan identifier
 * @returns Plan display name
 */
const getPlanName = (planId: string) => {
  // This can be retrieved from configuration
  // const plan = config.payment.plans[planId as keyof typeof config.payment.plans]
  // return plan?.name || planId
  return planId
}

/**
 * Get order status display configuration
 * @param status - Order status
 * @returns Status display object with text, variant, and icon
 */
const getOrderStatusDisplay = (status: string) => {
  switch (status) {
    case 'paid':
      return {
        text: t('dashboard.orders.status.paid'),
        variant: 'default' as const,
        icon: CheckCircle
      }
    case 'pending':
      return {
        text: t('dashboard.orders.status.pending'),
        variant: 'secondary' as const,
        icon: Clock
      }
    case 'failed':
      return {
        text: t('dashboard.orders.status.failed'),
        variant: 'destructive' as const,
        icon: XCircle
      }
    case 'refunded':
      return {
        text: t('dashboard.orders.status.refunded'),
        variant: 'outline' as const,
        icon: RotateCcw
      }
    case 'canceled':
      return {
        text: t('dashboard.orders.status.canceled'),
        variant: 'secondary' as const,
        icon: XCircle
      }
    default:
      return {
        text: status,
        variant: 'outline' as const,
        icon: AlertCircle
      }
  }
}

/**
 * Get payment provider display name
 * @param provider - Payment provider identifier
 * @returns Provider display name
 */
const getProviderDisplay = (provider: string) => {
  switch (provider) {
    case 'stripe':
      return t('dashboard.orders.provider.stripe')
    case 'wechat':
      return t('dashboard.orders.provider.wechat')
    case 'creem':
      return 'Creem'
    default:
      return provider
  }
}

// Fetch data when component is mounted
onMounted(() => {
  fetchOrdersData()
})
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle class="text-lg font-semibold flex items-center gap-2">
        <ShoppingCart class="h-5 w-5" />
        {{ t('dashboard.orders.title') }}
      </CardTitle>
      <div class="text-sm text-muted-foreground">
        {{ $t('dashboard.orders.page.totalOrders', { count: ordersData.length }) }}
      </div>
    </CardHeader>
    
    <CardContent>
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-pulse space-y-2">
          <div class="h-4 bg-muted rounded w-32"></div>
          <div class="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-destructive text-sm">
          {{ error }}
        </div>
      </div>
      
      <!-- No orders -->
      <div v-else-if="ordersData.length === 0" class="text-center py-8">
        <p class="text-muted-foreground mb-4">
          {{ t('dashboard.orders.noOrdersDescription') }}
        </p>
        <Button variant="outline" as-child>
          <NuxtLink :to="localePath('/pricing')">
            {{ t('dashboard.subscription.viewPlans') }}
          </NuxtLink>
        </Button>
      </div>
      
      <!-- Orders table -->
      <div v-else class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">
                {{ t('dashboard.orders.orderDetails.orderId') }}
              </TableHead>
              <TableHead class="w-[120px]">
                {{ t('dashboard.orders.orderDetails.amount') }}
              </TableHead>
              <TableHead class="w-[140px]">
                {{ t('dashboard.orders.orderDetails.plan') }}
              </TableHead>
              <TableHead class="w-[120px]">
                {{ t('dashboard.orders.orderDetails.status') }}
              </TableHead>
              <TableHead class="w-[120px]">
                {{ t('dashboard.orders.orderDetails.provider') }}
              </TableHead>
              <TableHead class="w-[120px]">
                {{ t('dashboard.orders.orderDetails.createdAt') }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="order in ordersData" 
              :key="order.id" 
              class="hover:bg-muted/50 transition-colors"
            >
              <TableCell class="font-mono text-xs">
                #{{ order.id.slice(-8) }}
              </TableCell>
              <TableCell class="font-medium">
                {{ formatAmount(order.amount, order.currency) }}
              </TableCell>
              <TableCell>
                {{ getPlanName(order.planId) }}
              </TableCell>
              <TableCell>
                <Badge :variant="getOrderStatusDisplay(order.status).variant">
                  <component 
                    :is="getOrderStatusDisplay(order.status).icon" 
                    class="h-3 w-3 mr-1" 
                  />
                  {{ getOrderStatusDisplay(order.status).text }}
                </Badge>
              </TableCell>
              <TableCell>
                {{ getProviderDisplay(order.provider) }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ formatDate(order.createdAt) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template> 