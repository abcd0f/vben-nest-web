import type { SystemPostApi } from './model';

import { requestClient } from '#/api/request';

export function postListApi(params?: SystemPostApi.ListParams) {
  return requestClient.get<SystemPostApi.ListResult>('/system/post/list', {
    params,
  });
}

export function postInfoApi(postId: string) {
  return requestClient.get<SystemPostApi.Post>(`/system/post/${postId}`);
}

export function createPostApi(data: SystemPostApi.CreateParams) {
  return requestClient.post<SystemPostApi.Post>('/system/post', data);
}

export function updatePostApi(data: SystemPostApi.UpdateParams) {
  return requestClient.put<SystemPostApi.Post>('/system/post', data);
}

export function deletePostApi(postId: string) {
  return requestClient.delete<null>(`/system/post/${postId}`);
}
