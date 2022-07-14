import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

const ResourceBeatifulMixin = {
  methods: {
    getResourceBeatiful(resourceUseDetail) {
      const obj = { cpuItems: [], memoryItems: [], storageItems: [], networkItems: [] };
      obj.cpuItems.push({
        max: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.MaxCPUUsageCore + 'core', 'n')),
        min: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.MinCPUUsageCore + 'core', 'n')),
        avg: beautifyCpuUnit(sizeOfCpu(resourceUseDetail.AvgCPUUsageCore + 'core', 'n')),
      });
      obj.memoryItems.push({
        max: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MaxMemoryUsageByte + 'B', 'B')),
        min: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MinMemoryUsageByte + 'B', 'B')),
        avg: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.AvgMemoryUsageByte + 'B', 'B')),
      });
      obj.storageItems.push({
        max: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MaxPVCUsageByte + 'B', 'B')),
        min: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.MinPVCUsageByte + 'B', 'B')),
        avg: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.AvgPVCUsageByte + 'B', 'B')),
      });
      obj.networkItems.push({
        in: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.NetworkReceiveByte + 'B', 'B')),
        out: beautifyStorageUnit(sizeOfStorage(resourceUseDetail.NetworkSendByte + 'B', 'B')),
      });
      return obj;
    },
  },
};

export { ResourceBeatifulMixin };
