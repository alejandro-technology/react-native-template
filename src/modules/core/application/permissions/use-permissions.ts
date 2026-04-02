import { useState, useCallback } from 'react';
import permissionsService from '../../infrastructure/permissions.service';
import type {
  PermissionType,
  PermissionStatus,
  PermissionResult,
} from '../../domain/permissions/permissions.model';

export function usePermission(type: PermissionType) {
  const [status, setStatus] = useState<PermissionStatus>('unavailable');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const check = useCallback(async () => {
    setIsLoading(true);
    const result = await permissionsService.check(type);
    setIsLoading(false);
    if (result instanceof Error) {
      setStatus('unavailable');
      return 'unavailable';
    }
    setStatus(result);
    return result;
  }, [type]);

  const request = useCallback(async () => {
    setIsLoading(true);
    const result = await permissionsService.request(type);
    setIsLoading(false);
    if (result instanceof Error) {
      setStatus('unavailable');
      setCanAskAgain(false);
      return {
        type,
        status: 'unavailable' as PermissionStatus,
        canAskAgain: false,
      };
    }
    setStatus(result.status);
    setCanAskAgain(result.canAskAgain);
    return result;
  }, [type]);

  const checkAndRequest = useCallback(async () => {
    setIsLoading(true);
    const result = await permissionsService.checkAndRequest(type);
    setIsLoading(false);
    if (result instanceof Error) {
      setStatus('unavailable');
      setCanAskAgain(false);
      return {
        type,
        status: 'unavailable' as PermissionStatus,
        canAskAgain: false,
      };
    }
    setStatus(result.status);
    setCanAskAgain(result.canAskAgain);
    return result;
  }, [type]);

  const openSettings = useCallback(async () => {
    await permissionsService.openSettings();
  }, []);

  return {
    status,
    canAskAgain,
    isLoading,
    check,
    request,
    checkAndRequest,
    openSettings,
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    isBlocked: status === 'blocked',
  };
}

export function usePermissions(types: PermissionType[]) {
  const [results, setResults] = useState<PermissionResult[]>(
    types.map(type => ({
      type,
      status: 'unavailable' as PermissionStatus,
      canAskAgain: true,
    })),
  );
  const [isLoading, setIsLoading] = useState(false);

  const checkAll = useCallback(async () => {
    setIsLoading(true);
    const result = await permissionsService.checkMultiple(types);
    setIsLoading(false);
    if (result instanceof Error) {
      return [];
    }
    setResults(result);
    return result;
  }, [types]);

  const requestAll = useCallback(async () => {
    setIsLoading(true);
    const result = await permissionsService.requestMultiple(types);
    setIsLoading(false);
    if (result instanceof Error) {
      return [];
    }
    setResults(result);
    return result;
  }, [types]);

  const openSettings = useCallback(async () => {
    await permissionsService.openSettings();
  }, []);

  const getStatus = useCallback(
    (type: PermissionType) => {
      return results.find(r => r.type === type)?.status ?? 'unavailable';
    },
    [results],
  );

  const isGranted = useCallback(
    (type: PermissionType) => getStatus(type) === 'granted',
    [getStatus],
  );

  return {
    results,
    isLoading,
    checkAll,
    requestAll,
    openSettings,
    getStatus,
    isGranted,
  };
}
