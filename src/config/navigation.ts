import {
	Gift,
	BookOpen,
	Flag,
	Trophy,
	PartyPopper,
	Award,
	DoorClosed,
	type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// Country RNG 2 内容导航分类（与 content/<locale>/ 目录一一对应）
// community 分类按需求移除，不进入导航栏
// 顺序按 SEO 意图排列：兑换码 → 攻略 → 国家 → 强度榜 → 活动 → 徽章 → 秘密房间
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Gift, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'countries', path: '/countries', icon: Flag, isContentType: true },
	{ key: 'tierList', path: '/tier-list', icon: Trophy, isContentType: true },
	{ key: 'events', path: '/events', icon: PartyPopper, isContentType: true },
	{ key: 'badges', path: '/badges', icon: Award, isContentType: true },
	{ key: 'rooms', path: '/rooms', icon: DoorClosed, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/'

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
