import { NextResponse } from 'next/server';
import { checkSubscriptionStatus, isLifetimeMember } from '@libs/database/utils/subscription';
import { safeGetSession } from '@/lib/safe-get-session';

/**
 * 获取当前用户的订阅状态
 */
export async function GET(request: Request) {
  // 获取当前用户 (authMiddleware已验证用户已登录)
  const sessionHeaders = new Headers(request.headers);
  const session = await safeGetSession({
    headers: sessionHeaders
  });
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  // 检查订阅状态
  const subscription = await checkSubscriptionStatus(userId);
  console.log('subscription', subscription);
  const isLifetime = await isLifetimeMember(userId);
  
  return NextResponse.json({
    hasSubscription: !!subscription,
    isLifetime,
    subscription: subscription || null
  });
} 
