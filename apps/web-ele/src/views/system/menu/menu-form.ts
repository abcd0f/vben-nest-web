import type { SystemMenuApi } from '#/api/system/menu/model';

type MenuType = SystemMenuApi.CreateParams['menuType'];
type MenuMeta = NonNullable<SystemMenuApi.CreateParams['meta']>;
type MetaKey = keyof MenuMeta;

export type MenuFormValues = SystemMenuApi.CreateParams & { linkSrc?: string };

/* -------------------------------------------------------------------------- */
/*  常量                                                                       */
/* -------------------------------------------------------------------------- */

/** 菜单类型：目录 / 菜单 / 按钮 / 外链 / 内嵌 iframe */
const MENU_TYPE = {
  directory: 'M',
  menu: 'C',
  button: 'F',
  link: 'L',
  iframe: 'E',
} as const satisfies Record<string, MenuType>;

const { directory, menu, button, link, iframe } = MENU_TYPE;

const ALL_MENU_TYPES = [directory, menu, button, link, iframe] as const;

const HTTP_URL_RE = /^https?:\/\//i;
/** 旧版数据中 isFrame === '0' 表示外部链接 */
const LEGACY_FRAME_FLAG = '0';
const PLACEHOLDER_ICON = '#';

/* -------------------------------------------------------------------------- */
/*  meta 规则（声明式）                                                         */
/* -------------------------------------------------------------------------- */

/**
 * 字段适用性：字段只在 types 列出的菜单类型下保留。
 * 新增菜单类型 / meta 字段时，只需要改这张表。
 */
const META_RULES: ReadonlyArray<{
  keys: readonly MetaKey[];
  types: readonly MenuType[];
}> = [
  { keys: ['activePath', 'affixTab'], types: [menu, iframe] },
  { keys: ['hideChildrenInMenu'], types: [menu, directory] },
  {
    keys: ['activeIcon', 'hideInBreadcrumb', 'hideInTab'],
    types: [directory, menu, button, iframe],
  },
];

/** 链接类字段由 linkSrc 统一接管：先整体剔除，再按类型回写 */
const LINK_KEYS: readonly MetaKey[] = ['link', 'iframeSrc'];

/** 值为空时应"不存在"的字段（均为字符串类字段，使用假值判断即可） */
const OMIT_WHEN_EMPTY: ReadonlySet<MetaKey> = new Set([
  'activePath',
  'badgeType',
  'badgeVariants',
]);

const DEFAULT_BLOCKED_KEYS: ReadonlySet<MetaKey> = new Set(LINK_KEYS);

/** 模块加载时一次性展开：菜单类型 → 需要剔除的 meta 键集合 */
const BLOCKED_KEYS_BY_TYPE: ReadonlyMap<
  MenuType,
  ReadonlySet<MetaKey>
> = new Map(
  ALL_MENU_TYPES.map((type) => [
    type,
    new Set<MetaKey>([
      ...LINK_KEYS,
      ...META_RULES.filter((rule) => !rule.types.includes(type)).flatMap(
        (rule) => rule.keys,
      ),
    ]),
  ]),
);

/* -------------------------------------------------------------------------- */
/*  工具函数                                                                   */
/* -------------------------------------------------------------------------- */

const normalizeUrl = (value?: null | string) => value?.trim() || undefined;

/** 旧版 URL 路由：isFrame === '0' 且 path 为 http(s) 地址 */
function isLegacyFrame(record: SystemMenuApi.Menu): boolean {
  return (
    record.isFrame === LEGACY_FRAME_FLAG && HTTP_URL_RE.test(record.path ?? '')
  );
}

/** 仅 L / E 类型从各自的 meta 字段读取链接地址，旧版 URL 路由读取 path */
function resolveLinkSrc(
  record: SystemMenuApi.Menu,
  legacy: boolean,
): string | undefined {
  if (legacy) return record.path ?? undefined;
  switch (record.menuType) {
    case link: {
      return record.meta?.link;
    }
    case iframe: {
      return record.meta?.iframeSrc;
    }
    default: {
      return undefined;
    }
  }
}

/** 不使用 delete：通过 filter 构造新对象，避免 V8 dictionary mode 退化 */
function buildMeta(values: MenuFormValues): MenuMeta {
  const { menuType } = values;
  const blocked = BLOCKED_KEYS_BY_TYPE.get(menuType) ?? DEFAULT_BLOCKED_KEYS;
  const src = normalizeUrl(values.linkSrc);
  const keepBadge = values.meta?.badgeType === 'normal';

  const kept = Object.entries(values.meta ?? {}).filter(([key, value]) => {
    const metaKey = key as MetaKey;
    if (blocked.has(metaKey)) return false;
    if (metaKey === 'badge' && !keepBadge) return false;
    if (OMIT_WHEN_EMPTY.has(metaKey) && !value) return false;
    return true;
  });

  return {
    ...Object.fromEntries(kept),
    ...(menuType === link && { link: src }),
    ...(menuType === iframe && { iframeSrc: src }),
  } as MenuMeta;
}

/* -------------------------------------------------------------------------- */
/*  对外 API                                                                   */
/* -------------------------------------------------------------------------- */

/** 后端数据 → 表单值（旧版 URL 路由按其 iframe 行为回填为内嵌页面）。 */
export function decodeMenuForm(record: SystemMenuApi.Menu): MenuFormValues {
  const legacy = isLegacyFrame(record);

  return {
    ...record,
    component: record.component ?? undefined,
    icon:
      record.icon === PLACEHOLDER_ICON ? undefined : (record.icon ?? undefined),
    menuType: legacy ? iframe : record.menuType,
    meta: { ...record.meta },
    path: legacy ? `/iframe/${record.menuId}` : (record.path ?? undefined),
    linkSrc: resolveLinkSrc(record, legacy),
  };
}

/** 表单值 → 提交参数：只提交菜单字段，并清除切换类型后不再适用的配置。 */
export function encodeMenuForm(
  values: MenuFormValues,
): SystemMenuApi.CreateParams {
  const { menuType } = values;
  const isButton = menuType === button;
  const isLink = menuType === link;
  const isMenu = menuType === menu;

  return {
    menuId: values.menuId,
    parentId: values.parentId,
    menuName: values.menuName,
    routeName: values.routeName,
    menuType,
    orderNum: values.orderNum,
    path: isButton || isLink ? null : values.path,
    component: isMenu ? values.component : null,
    perms: isLink ? null : values.perms,
    icon: isButton ? null : values.icon,
    isFrame: '1',
    isCache: isMenu ? values.isCache : '1',
    visible: isButton ? '0' : values.visible,
    status: values.status,
    meta: isButton ? {} : buildMeta(values),
    query: values.query,
    remark: values.remark,
  };
}
