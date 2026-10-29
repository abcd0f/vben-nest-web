import { createApp } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MenuDrawer from './menu-drawer.vue';

const mocks = vi.hoisted(() => ({
  drawerOptions: {} as Record<string, (...args: any[]) => any>,
  drawerApi: {
    close: vi.fn(),
    getData: vi.fn(),
    lock: vi.fn(),
  },
  formApi: {
    getValues: vi.fn(),
    reset: vi.fn(),
    setFieldValue: vi.fn(),
    setValues: vi.fn(),
    updateSchema: vi.fn(),
    validate: vi.fn(),
  },
  create: vi.fn(),
  info: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@vben/common-ui', () => ({
  useVbenDrawer: (options: typeof mocks.drawerOptions) => {
    mocks.drawerOptions = options;
    return [{ render: () => null }, mocks.drawerApi];
  },
}));
vi.mock('@vben/locales', () => ({ $t: (value: string) => value }));
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn() },
  ElMessageBox: { confirm: vi.fn() },
  ElSkeleton: { render: () => null },
}));
vi.mock('#/adapter/form', () => ({
  useVbenForm: () => [{ render: () => null }, mocks.formApi],
}));
vi.mock('#/api/system/menu', () => ({
  createMenuApi: mocks.create,
  menuInfoApi: mocks.info,
  menuListApi: mocks.list,
  updateMenuApi: mocks.update,
}));
vi.mock('./data', () => ({ menuFormSchema: () => [] }));

describe('菜单抽屉', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.drawerApi.getData.mockReturnValue({ update: false });
    mocks.list.mockResolvedValue([
      { menuId: '1', parentId: '0', menuName: '系统', menuType: 'M' },
      { menuId: '2', parentId: '1', menuName: '用户', menuType: 'C' },
      { menuId: '3', parentId: '2', menuName: '新增', menuType: 'F' },
      { menuId: '4', parentId: '2', menuName: '详情', menuType: 'C' },
    ]);
    mocks.formApi.getValues.mockResolvedValue({});
    mocks.formApi.validate.mockResolvedValue({ valid: true });
    app = createApp(MenuDrawer);
    app.mount(document.createElement('div'));
  });

  afterEach(() => {
    app.unmount();
    vi.restoreAllMocks();
  });

  it('上级菜单显示完整路径，并排除按钮', async () => {
    await mocks.drawerOptions.onOpenChange!(true);
    const [schema] = mocks.formApi.updateSchema.mock.lastCall![0];
    const root = schema.componentProps.data[0];
    expect(root.menuId).toBe('0');
    expect(root.children[0].children[0].fullName).toBe('根菜单 / 系统 / 用户');
    expect(root.children[0].children[0].children.map((item: { menuId: string }) => item.menuId)).toEqual(['4']);
  });

  it('新增子级仅设置上级，不请求详情或重复回填默认值', async () => {
    mocks.drawerApi.getData.mockReturnValue({ id: '2', update: false });
    await mocks.drawerOptions.onOpenChange!(true);
    expect(mocks.formApi.setFieldValue).toHaveBeenCalledWith('parentId', '2');
    expect(mocks.info).not.toHaveBeenCalled();
    expect(mocks.formApi.setValues).not.toHaveBeenCalled();
  });

  it('详情直接回填，且不能选择自身及后代作为上级', async () => {
    const record = { menuId: '2', parentId: '1', icon: null, path: null };
    mocks.drawerApi.getData.mockReturnValue({ id: '2', update: true });
    mocks.info.mockResolvedValue(record);
    await mocks.drawerOptions.onOpenChange!(true);
    expect(mocks.info).toHaveBeenCalledWith('2');
    expect(mocks.formApi.setValues).toHaveBeenCalledWith(record);
    const [schema] = mocks.formApi.updateSchema.mock.lastCall![0];
    expect(schema.componentProps.data[0].children[0].children).toEqual([]);
  });

  it('从菜单切换为按钮后，提交清空路由字段且不修改表单值', async () => {
    const values = { menuType: 'F', path: 'user', component: 'system/user/index', perms: 'system:user:add' };
    mocks.formApi.getValues.mockResolvedValue(values);
    await mocks.drawerOptions.onConfirm!();
    expect(mocks.create).toHaveBeenCalledWith({ ...values, path: null, component: null });
    expect(values.path).toBe('user');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('从菜单切换为目录后，PUT 保留 ID 并清空权限标识', async () => {
    mocks.drawerApi.getData.mockReturnValue({ id: '2', update: true });
    mocks.info.mockResolvedValue({ menuId: '2', parentId: '1' });
    await mocks.drawerOptions.onOpenChange!(true);
    const values = { menuId: '2', menuType: 'M', perms: 'system:user:list' };
    mocks.formApi.getValues.mockResolvedValue(values);
    await mocks.drawerOptions.onConfirm!();
    expect(mocks.update).toHaveBeenCalledWith({ ...values, perms: null });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('校验失败时不保存，并解除锁定', async () => {
    mocks.formApi.validate.mockResolvedValue({ valid: false });
    await mocks.drawerOptions.onConfirm!();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.drawerApi.close).not.toHaveBeenCalled();
    expect(mocks.drawerApi.lock).toHaveBeenLastCalledWith(false);
  });

  it('加载失败时解除锁定，避免提交未加载的详情', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.list.mockRejectedValueOnce(new Error('加载失败'));
    await mocks.drawerOptions.onOpenChange!(true);
    expect(mocks.drawerApi.lock).toHaveBeenLastCalledWith(false);
    expect(mocks.drawerApi.close).toHaveBeenCalled();
  });

  it('保存失败时保留抽屉并解除锁定', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.create.mockRejectedValueOnce(new Error('保存失败'));
    await mocks.drawerOptions.onConfirm!();
    expect(mocks.drawerApi.close).not.toHaveBeenCalled();
    expect(mocks.drawerApi.lock).toHaveBeenLastCalledWith(false);
  });
});
