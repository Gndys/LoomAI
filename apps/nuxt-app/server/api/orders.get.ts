import { auth } from '@libs/auth'
import { db } from '@libs/database'
import { order } from '@libs/database/schema/order'
import { eq, desc } from 'drizzle-orm'

/**
 * Get user's order history
 */
export default defineEventHandler(async (event) => {
  try {
    // Get current user session (authMiddleware已验证用户已登录)
    const user = event.context.user || await (async () => {
      const headers = new Headers()
      Object.entries(getHeaders(event)).forEach(([key, value]) => {
        if (value) headers.set(key, value)
      })
      
      const session = await auth.api.getSession({ headers })
      return session?.user
    })()
    
    const userId = user!.id
    
    // Get user's orders ordered by creation date (newest first)
    const userOrders = await db.select({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      planId: order.planId,
      status: order.status,
      provider: order.provider,
      providerOrderId: order.providerOrderId,
      metadata: order.metadata,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }).from(order)
      .where(eq(order.userId, userId))
      .orderBy(desc(order.createdAt))
    
    return {
      orders: userOrders,
      total: userOrders.length
    }
  } catch (error) {
    console.error('Failed to fetch user orders:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders'
    })
  }
}) 