"use client";

import { useState, Suspense, lazy } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Clock,
  Coins,
  ExternalLink,
  Flag,
  Gift,
  GraduationCap,
  Info,
  ListChecks,
  PartyPopper,
  Server,
  ShoppingBag,
  Sparkles,
  Target,
  TreePine,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// Tools Grid 卡片 -> section id 一一对应（8 张卡锚点 8 个模块）
const TOOL_SECTION_IDS = [
  "codes",
  "beginner-guide",
  "tier-list",
  "countries-and-rarities",
  "luck-and-upgrade-tree",
  "gamepasses-and-boosts",
  "events-and-rare-rolls",
  "updates-and-server-status",
];

// Tier 徽章样式（S/A/B/C 主题色透明度梯度，无 hex 硬编码）
const TIER_BADGE: Record<string, string> = {
  S: "bg-[hsl(var(--nav-theme))] text-white border-transparent",
  A: "bg-[hsl(var(--nav-theme)/0.22)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.4)]",
  B: "bg-white/10 text-foreground border-border",
  C: "bg-white/5 text-muted-foreground border-border",
};

function isUrl(value: string) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

// 模块标题块（图标 + 标题 + 副标题 + 介绍）
function ModuleHeader({
  icon: Icon,
  title,
  subtitle,
  intro,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  intro?: string;
}) {
  return (
    <div className="text-center mb-8 md:mb-12 scroll-reveal">
      <div className="inline-flex items-center justify-center gap-3 mb-4">
        <div className="flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
          <Icon className="h-5 w-5 md:h-7 md:w-7 text-[hsl(var(--nav-theme-light))]" />
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
      {intro && (
        <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto mt-3">
          {intro}
        </p>
      )}
    </div>
  );
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.countryrng2.wiki";
  // 内部链接已移除（任务要求删除所有内部 URL 链接）；占位保留 prop 签名避免改 page.tsx
  void moduleLinkMap;

  // Module 8 accordion state
  const [updatesExpanded, setUpdatesExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 模块数据（防御性访问）
  const M = t.modules || {};
  const codes = M.countryRng2Codes || {};
  const beginner = M.countryRng2BeginnerGuide || {};
  const tier = M.countryRng2TierList || {};
  const countries = M.countryRng2CountriesAndRarities || {};
  const luck = M.countryRng2LuckAndUpgradeTree || {};
  const gamepasses = M.countryRng2GamepassesAndBoosts || {};
  const events = M.countryRng2EventsAndRareRolls || {};
  const updates = M.countryRng2UpdatesAndServerStatus || {};

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Country RNG 2 Wiki",
        description:
          "Complete Country RNG 2 Wiki covering codes, countries, rarities, roll chances, luck upgrades, gamepasses, events, secrets, and update guides for the Roblox RNG game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Country RNG 2 - Roblox Flag-Rolling RNG Game",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Country RNG 2 Wiki",
        alternateName: "Country RNG 2",
        url: siteUrl,
        description:
          "Complete Country RNG 2 Wiki resource hub for codes, countries, rarities, luck upgrades, gamepasses, events, and update guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Country RNG 2 Wiki - Roblox Flag-Rolling RNG Game",
        },
        sameAs: [
          "https://www.roblox.com/games/93994609252204/Country-RNG-2",
          "https://www.roblox.com/communities/33245554/Retrobyte-Gamess",
          "https://discord.com/invite/retrobyte-games-1160709675784876062",
          "https://www.youtube.com/watch?v=UxoMJsBGPKs",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Country RNG 2",
        gamePlatform: ["Web Browser", "Roblox"],
        applicationCategory: "Game",
        genre: ["RNG", "Simulation", "Casual", "Collection"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/93994609252204/Country-RNG-2",
        },
      },
      {
        "@type": "VideoObject",
        name: "Roblox - Country RNG 2",
        description:
          "Country RNG 2 gameplay video showcasing rolling rare countries, flags, the upgrade tree, and lucky events on Roblox.",
        uploadDate: "2025-07-15",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/UxoMJsBGPKs",
        url: "https://www.youtube.com/watch?v=UxoMJsBGPKs",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                          bg-[hsl(var(--nav-theme)/0.1)]
                          border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <a
                href="https://discord.com/invite/retrobyte-games-1160709675784876062"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gift className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </a>
              <a
                href="https://www.roblox.com/games/93994609252204/Country-RNG-2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 之后 */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="UxoMJsBGPKs"
              title="Roblox - Country RNG 2"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {(t.tools.cards || []).map((card: any, index: number) => {
              const sectionId = TOOL_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                bg-[hsl(var(--nav-theme)/0.1)]
                                flex items-center justify-center
                                group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Codes */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Gift}
            title={codes.title}
            subtitle={codes.subtitle}
            intro={codes.intro}
          />

          {/* Active + Expired 两列 */}
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[codes.activeCodes, codes.expiredCodes].map(
              (block: any, i: number) =>
                block && (
                  <div
                    key={i}
                    className="p-5 bg-white/5 border border-border rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold flex items-center gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                        {block.heading}
                      </h3>
                      {block.lastChecked && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {block.lastChecked}
                        </span>
                      )}
                    </div>
                    {(block.codes || []).length > 0 ? (
                      <ul className="space-y-2">
                        {block.codes.map((c: any, ci: number) => (
                          <li
                            key={ci}
                            className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.2)] font-mono text-sm"
                          >
                            <Gift className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))]" />
                            {typeof c === "string" ? c : c.code}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {block.emptyState}
                      </p>
                    )}
                  </div>
                ),
            )}
          </div>

          {/* Listed Rewards */}
          {codes.listedRewards && (
            <div className="scroll-reveal p-5 bg-white/5 border border-border rounded-xl mb-6">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Coins className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                {codes.listedRewards.heading}
              </h3>
              {(codes.listedRewards.rewards || []).length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {codes.listedRewards.rewards.map((r: any, ri: number) => (
                    <li
                      key={ri}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-sm"
                    >
                      <Check className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))]" />
                      {typeof r === "string" ? r : `${r.code}: ${r.reward}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {codes.listedRewards.emptyState}
                </p>
              )}
            </div>
          )}

          {/* Redeem Steps */}
          {codes.redeemSteps && (
            <div className="scroll-reveal p-5 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <ListChecks className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                {codes.redeemSteps.heading}
              </h3>
              <ol className="space-y-3">
                {(codes.redeemSteps.steps || []).map((s: any, si: number) => (
                  <li key={si} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-white text-sm font-bold">
                      {s.step}
                    </span>
                    <span className="text-sm md:text-base text-muted-foreground pt-0.5">
                      {s.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={GraduationCap}
            title={beginner.title}
            subtitle={beginner.subtitle}
            intro={beginner.intro}
          />
          <div className="scroll-reveal space-y-3 md:space-y-4">
            {(beginner.steps || []).map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {step.step || index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3">
                    {step.instruction}
                  </p>
                  {step.mainSystems && step.mainSystems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {step.mainSystems.map((sys: string, mi: number) => (
                        <span
                          key={mi}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
                        >
                          <Target className="h-3 w-3 text-[hsl(var(--nav-theme-light))]" />
                          {sys}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.doNotDoFirst && (
                    <p className="text-xs md:text-sm flex items-start gap-2 text-muted-foreground/90">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span>{step.doNotDoFirst}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Tier List */}
      <section id="tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Trophy}
            title={tier.title}
            subtitle={tier.subtitle}
            intro={tier.intro}
          />
          <div className="scroll-reveal space-y-5 md:space-y-6">
            {(tier.tiers || []).map((tr: any, ti: number) => (
              <div
                key={ti}
                className="p-4 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold border ${TIER_BADGE[tr.tier] || TIER_BADGE.C}`}
                  >
                    {tr.tier}
                  </span>
                  <h3 className="font-bold text-lg">{tr.label}</h3>
                </div>
                {tr.criteria && tr.criteria.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mb-4">
                    {tr.criteria.map((c: string, ci: number) => (
                      <li
                        key={ci}
                        className="inline-flex items-start gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(tr.entries || []).map((e: any, ei: number) => (
                    <div
                      key={ei}
                      className="p-4 bg-white/5 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          {e.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {e.basis}
                      </p>
                      {e.valueTags && e.valueTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {e.valueTags.map((tag: string, vi: number) => (
                            <span
                              key={vi}
                              className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-border text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Countries and Rarities */}
      <section
        id="countries-and-rarities"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Flag}
            title={countries.title}
            subtitle={countries.subtitle}
            intro={countries.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {(countries.rows || []).map((row: any, ri: number) => (
              <div
                key={ri}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl leading-none">{row.flag}</span>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{row.country}</h3>
                    <span className="text-xs text-muted-foreground">
                      {row.versionSource}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {row.rarity}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-border">
                    {row.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{row.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Luck and Upgrade Tree */}
      <section id="luck-and-upgrade-tree" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={TreePine}
            title={luck.title}
            subtitle={luck.subtitle}
            intro={luck.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(luck.cards || []).map((card: any, ci: number) => (
              <div
                key={ci}
                className="p-5 bg-white/5 border border-border rounded-xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                    {card.label}
                  </h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.3)] text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                    {card.priority}
                  </span>
                </div>
                <p className="text-sm font-medium mb-2">{card.effect}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Changes:</span>{" "}
                  {card.whatItChanges}
                </p>
                <p className="text-xs text-muted-foreground/90 mt-auto pt-2 border-t border-border">
                  {card.howToUse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Gamepasses and Boosts */}
      <section
        id="gamepasses-and-boosts"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={ShoppingBag}
            title={gamepasses.title}
            subtitle={gamepasses.subtitle}
            intro={gamepasses.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(gamepasses.rows || []).map((row: any, ri: number) => (
              <div
                key={ri}
                className="p-5 bg-white/5 border border-border rounded-xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{row.pass}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                    <Coins className="h-4 w-4" />
                    {row.priceRobux}
                  </span>
                </div>
                <p className="text-sm mb-3">{row.officialEffect}</p>
                <div className="space-y-2 text-xs text-muted-foreground mt-auto">
                  <p>
                    <span className="font-semibold text-foreground/80">Best for:</span>{" "}
                    {row.bestFor}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground/80">Free path:</span>{" "}
                    {row.freePath}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground/80">Value:</span>{" "}
                    {row.valueNote}
                  </p>
                  <p className="flex items-center gap-1 pt-1">
                    <Clock className="h-3 w-3" />
                    {row.storeUpdate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Events and Rare Rolls */}
      <section id="events-and-rare-rolls" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={PartyPopper}
            title={events.title}
            subtitle={events.subtitle}
            intro={events.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {(events.cards || []).map((card: any, ci: number) => (
              <div
                key={ci}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    <Bell className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <h3 className="font-bold">{card.event}</h3>
                </div>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trigger</dt>
                    <dd className="text-muted-foreground">{card.trigger}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signal</dt>
                    <dd className="text-muted-foreground">{card.eventSignal}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reward</dt>
                    <dd className="text-muted-foreground">{card.rewardType}</dd>
                  </div>
                </dl>
                {card.playerSteps && card.playerSteps.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {card.playerSteps.map((ps: string, psi: number) => (
                      <li
                        key={psi}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{ps}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Updates and Server Status (Accordion) */}
      <section
        id="updates-and-server-status"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Server}
            title={updates.title}
            subtitle={updates.subtitle}
            intro={updates.intro}
          />
          <div className="scroll-reveal space-y-3">
            {(updates.sections || []).map((sec: any, si: number) => {
              const open = updatesExpanded === si;
              return (
                <div
                  key={si}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() => setUpdatesExpanded(open ? null : si)}
                    className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Activity className="h-5 w-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                      <span className="min-w-0">
                        <span className="font-bold block truncate">
                          {sec.section}
                        </span>
                        <span className="text-xs text-muted-foreground block truncate">
                          {sec.summary}
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-3">
                        {(sec.details || []).map((d: any, di: number) => (
                          <div
                            key={di}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-3 py-1"
                          >
                            <dt className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                              {d.label}
                            </dt>
                            <dd className="text-sm text-right">
                              {isUrl(d.value) ? (
                                <a
                                  href={d.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[hsl(var(--nav-theme-light))] hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Link
                                </a>
                              ) : (
                                <span className="text-foreground/90">
                                  {d.value}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/retrobyte-games-1160709675784876062"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/93994609252204/Country-RNG-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/33245554/Retrobyte-Gamess"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=UxoMJsBGPKs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
