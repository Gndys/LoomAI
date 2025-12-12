'use client';

import { config } from '@config';
import { useTranslation } from "@/hooks/use-translation";
import type { Plan } from '@config';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { authClientReact } from "@libs/auth/authClient";
import QRCode from 'qrcode';
import { motion } from "framer-motion";
import { 
  Check, 
  Star, 
  Sparkles,
  Crown,
  Zap,
  Shield,
  ArrowRight,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Steps, Step } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const { data: session, isPending } = authClientReact.useSession();
  const user = session?.user;

  const plans = Object.values(config.payment.plans) as unknown as Plan[];
  const imagePlans = plans.filter((plan) => plan.unit?.type === "image");
  const displayPlans = imagePlans.length > 0 ? imagePlans : plans;

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startPolling = (orderId: string) => {
    // 先清除可能存在的轮询
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/query?orderId=${orderId}&provider=wechat`);
        const data = await response.json();

        if (data.status === 'paid') {
          clearInterval(interval);
          setPollingInterval(null);
          router.push(`/${currentLocale}/payment-success?provider=wechat`);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error(t.payment.result.failed);
          closeQrCodeModal();
        }
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 3000); // 每3秒查询一次

    setPollingInterval(interval);
  };

  const handleSubscribe = async (plan: Plan) => {
    try {
      if (!user) {
        const returnPath = encodeURIComponent(pathname);
        router.push(`/${currentLocale}/signin?returnTo=${returnPath}`);
        return;
      }

      setLoading(plan.id);
      const provider = plan.provider || 'stripe';
      setCurrentPlan(plan);
      
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          provider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }
      
      if (provider === 'wechat') {
        if (data.paymentUrl) {
          try {
            const qrDataUrl = await QRCode.toDataURL(data.paymentUrl);
            setQrCodeUrl(qrDataUrl);
            setOrderId(data.providerOrderId);
            setCurrentStep(1);
            startPolling(data.providerOrderId);
          } catch (err) {
            console.error('QR code generation error:', err);
            toast.error(t.common.unexpectedError);
          }
        }
      } else {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t.common.unexpectedError);
    } finally {
      setLoading(null);
    }
  };

  const closeQrCodeModal = () => {
    // 如果当前正在处理支付，提示用户确认是否取消
    if (currentStep < 2 && orderId) { // 还未完成支付且有订单ID
      const confirmCancel = window.confirm(t.payment.confirmCancel);
      if (!confirmCancel) {
        return; // 用户取消关闭，继续支付流程
      }
      
      // 调用关闭订单API
      fetch(`/api/payment/cancel?orderId=${orderId}&provider=wechat`, {
        method: 'POST'
      }).then(response => {
        if (response.ok) {
          toast.info(t.payment.orderCanceled);
        } else {
          console.error('Failed to cancel order');
          toast.error(t.common.unexpectedError);
        }
      }).catch(error => {
        console.error('Cancel order error:', error);
        toast.error(t.common.unexpectedError);
      });
    }
    
    setQrCodeUrl(null);
    setCurrentPlan(null);
    setCurrentStep(0);
    setOrderId(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const steps: Step[] = [
    { title: t.payment.steps.initiate, description: t.payment.steps.initiateDesc },
    { title: t.payment.steps.scan, description: t.payment.steps.scanDesc },
    { title: t.payment.steps.pay, description: t.payment.steps.payDesc },
  ];

  // 获取推荐计划
  const getRecommendedPlan = () => {
    return displayPlans.find((plan) => plan.recommended) || displayPlans[0];
  };

  const recommendedPlan = getRecommendedPlan();
  const sortedPlans = [...displayPlans].sort(
    (a, b) => Number(b.recommended ?? false) - Number(a.recommended ?? false),
  );
  const valueHighlights = [
    t.pricing.features.securePayment,
    t.pricing.features.flexibleSubscription,
    t.pricing.features.globalCoverage,
  ];
  const getCurrencySymbol = (currency: string) => (currency === "CNY" ? "¥" : "$");
  const getUnitName = (plan: Plan, plural = true) => {
    if (plan.unit?.type === "image") {
      if (currentLocale === "zh-CN") return "张";
      if (!plural || plan.unit.quantity <= 1) return "image";
      return "images";
    }
    return "";
  };
  const formatPerUnitLabel = (plan: Plan) => {
    if (!plan.unit?.quantity) return null;
    const perUnit = plan.amount / plan.unit.quantity;
    const symbol = getCurrencySymbol(plan.currency);
    const unitName = getUnitName(plan, false) || "unit";
    return `${symbol}${perUnit.toFixed(2)}/${unitName}`;
  };
  const formatIncludedLabel = (plan: Plan) => {
    if (!plan.unit?.quantity) return null;
    if (currentLocale === "zh-CN") {
      return `含 ${plan.unit.quantity} 张`;
    }
    const unitWord = plan.unit.quantity > 1 ? "images" : "image";
    return `Includes ${plan.unit.quantity} ${unitWord}`;
  };
  const getPaymentTypeLabel = (type: "one_time" | "recurring") =>
    type === "one_time"
      ? (t.dashboard?.subscription?.paymentType?.oneTime as string) || "One-time"
      : (t.dashboard?.subscription?.paymentType?.recurring as string) || "Recurring";

  return (
    <>
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-28 overflow-hidden">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-chart-1/15 blur-3xl animate-blob" />
          <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-chart-3/15 blur-3xl animate-blob animation-delay-2000" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <motion.div 
              className="mx-auto max-w-4xl text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 px-4 py-2 bg-chart-1-bg-15 rounded-full border border-chart-1/20 mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4 text-chart-1" />
                <span className="text-xs font-medium text-chart-1">{t.pricing.title}</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                <span className="text-gradient-chart-warm">{t.pricing.subtitle}</span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t.pricing.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards - redesigned */}
        <section className="relative pb-28">
          <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-chart-1/10 via-background to-background -z-10 blur-3xl" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-start">
              {recommendedPlan && (
                <motion.div
                  className="relative overflow-hidden rounded-3xl border border-chart-1/20 bg-card/90 p-8 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-1/15 via-transparent to-chart-3/15" />
                  <div className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-chart-1/15 blur-3xl" />
                  <div className="relative space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-chart-warm px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md">
                        <Crown className="h-4 w-4" />
                        {t.pricing.recommendedBadge}
                      </span>
                      {formatIncludedLabel(recommendedPlan) && (
                        <span className="rounded-full bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                          {formatIncludedLabel(recommendedPlan)}
                        </span>
                      )}
                      {formatPerUnitLabel(recommendedPlan) && (
                        <span className="rounded-full border border-chart-1/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-chart-1">
                          {formatPerUnitLabel(recommendedPlan)}
                        </span>
                      )}
                      <span className="rounded-full border border-chart-1/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-chart-1">
                        {recommendedPlan.provider}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-3xl font-semibold text-foreground">
                        {recommendedPlan.i18n?.[currentLocale]?.name || 'Plan'}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {recommendedPlan.i18n?.[currentLocale]?.description || ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-foreground">
                          {getCurrencySymbol(recommendedPlan.currency)}
                          {recommendedPlan.amount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {currentLocale === "zh-CN" ? "总价" : "Total"}
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="gap-2 rounded-full bg-gradient-chart-warm px-6 text-primary-foreground shadow-lg hover:opacity-90"
                        onClick={() => handleSubscribe(recommendedPlan)}
                        disabled={loading === recommendedPlan.id || isPending}
                      >
                        {loading === recommendedPlan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t.common.loading}
                          </>
                        ) : (
                          <>
                            {t.pricing.cta}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {valueHighlights.map((item, index) => {
                        const Icon = [Shield, Zap, Star][index % 3];
                        return (
                          <div
                            key={item.title}
                            className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner backdrop-blur"
                          >
                            <div className="flex items-start gap-3">
                              <span className="rounded-lg bg-background/60 p-2 text-chart-1">
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(recommendedPlan.i18n?.[currentLocale]?.features || []).slice(0, 6).map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-chart-1/30 bg-card/70 px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-5">
                {sortedPlans.map((plan, index) => {
                  const i18n = plan.i18n?.[currentLocale];
                  const isHighlighted = recommendedPlan && plan.id === recommendedPlan.id;
                  const isLifetime = plan.id === 'lifetime';
                  const features = i18n?.features || [];

                  return (
                    <motion.div
                      key={plan.id}
                      className={`relative overflow-hidden rounded-2xl border bg-card/85 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 ${
                        isHighlighted ? 'border-chart-1/50 ring-1 ring-chart-1/30' : 'border-border/70'
                      }`}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.06 }}
                      viewport={{ once: true }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-chart-1/5" />
                      <div className="relative space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {plan.provider}
                              </span>
                              {isHighlighted && (
                                <span className="rounded-full bg-chart-1/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-chart-1">
                                  {t.pricing.recommendedBadge}
                                </span>
                              )}
                              {isLifetime && (
                                <span className="rounded-full bg-chart-5-bg-15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-chart-5">
                                  {t.pricing.lifetimeBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {formatIncludedLabel(plan) && (
                                <span className="rounded-full bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                  {formatIncludedLabel(plan)}
                                </span>
                              )}
                              {formatPerUnitLabel(plan) && (
                                <span className="rounded-full border border-chart-1/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-chart-1">
                                  {formatPerUnitLabel(plan)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-foreground">{i18n?.name || 'Plan'}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{i18n?.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-foreground">
                              {getCurrencySymbol(plan.currency)}
                              {plan.amount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {currentLocale === "zh-CN" ? "总价" : "Total"}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          {features.slice(0, 5).map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-1/15 text-chart-1">
                                <Check className="h-3 w-3" />
                              </span>
                              <p className="text-sm text-foreground">{feature}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                            <span className="rounded-full border border-border/80 px-3 py-1">
                              {i18n?.duration || ''}
                            </span>
                            <span className="rounded-full border border-border/80 px-3 py-1">
                              {getPaymentTypeLabel(plan.duration.type)}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleSubscribe(plan)}
                            disabled={loading === plan.id || isPending}
                            className={`gap-2 rounded-full px-5 ${
                              isHighlighted
                                ? 'bg-gradient-chart-warm text-primary-foreground shadow-lg hover:opacity-90'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            } disabled:opacity-50`}
                          >
                            {loading === plan.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t.common.loading}
                              </>
                            ) : (
                              <>
                                {t.pricing.cta}
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      <Dialog open={!!qrCodeUrl} onOpenChange={(open) => !open && closeQrCodeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {currentPlan && (
                <span>
                  {currentPlan.currency === 'CNY' ? '¥' : '$'}{currentPlan.amount} - 
                  {currentPlan.i18n?.[currentLocale]?.name || 'Plan'}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6">
            <Steps steps={steps} currentStep={currentStep} />
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="WeChat Pay QR Code" 
                  className="w-64 h-64"
                />
                <p className="text-sm text-gray-500">
                  {t.payment.scanQrCode}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
