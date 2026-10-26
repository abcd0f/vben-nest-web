import { computed } from 'vue';

import { preferences, updatePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

/**
 * 超级管理员通配权限码
 *
 * 后端 `AuthService` 对 `superadmin` 角色只下发这一个码（不逐条查询权限表），
 * 因此前端判断权限时必须先做通配匹配，否则超管的所有按钮都会被判成无权限。
 */
const SUPER_ADMIN_PERMISSION_CODE = '*:*:*';

function useAccess() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * 基于角色判断是否有权限
   * @description: Determine whether there is permission，The role is judged by the user's role
   * @param roles
   */
  function hasAccessByRoles(roles: string[]) {
    const userRoleSet = new Set(userStore.userRoles);
    const intersection = roles.filter((item) => userRoleSet.has(item));
    return intersection.length > 0;
  }

  /**
   * 基于权限码判断是否有权限
   * @description: Determine whether there is permission，The permission code is judged by the user's permission code
   * @param codes
   */
  function hasAccessByCodes(codes: string[]) {
    const userCodesSet = new Set(accessStore.accessCodes);

    // 通配码直接放行：后端超管只下发 `*:*:*`
    if (userCodesSet.has(SUPER_ADMIN_PERMISSION_CODE)) {
      return true;
    }

    const intersection = codes.filter((item) => userCodesSet.has(item));
    return intersection.length > 0;
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    });
  }

  return {
    accessMode,
    hasAccessByCodes,
    hasAccessByRoles,
    toggleAccessMode,
  };
}

export { useAccess };
