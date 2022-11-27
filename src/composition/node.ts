import { Node } from '@/types/node';

export const useNodePagination = async (
  node: Node,
  cluster: string,
  page = 1,
  size = 10,
): Promise<Pagination<Node>> => {
  const _data: KubePaginationResponse<Node[]> = await node.getNodeList(cluster, {
    page: page,
    size: size,
    noprocessing: true,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Node>;
};
