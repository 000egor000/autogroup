// Хук | useProgress | для отображения текущего хода выполнения операции, *options-объект значений(за которыми следим)

import React, { useMemo } from 'react';
import { Progress } from 'rsuite';

const status = { 0: 'fail', 50: 'active', 100: 'success' };

export function useProgress(options) {
  const getPercent = useMemo(() => {
    const lenght = Object.keys(options)?.length;
    const trueValueLenght = Object.keys(options)?.filter((el) => !!options[el])?.length;

    return Math.round((trueValueLenght / lenght) * 100);
  }, [options]);

  const getStatus = useMemo(() => {
    const getKey = Object.keys(status)
      ?.filter((el) => {
        if (+getPercent >= +el) return status[el];
      })
      .at(-1);
    return status[getKey];
  }, [getPercent]);

  const getProgressLine = useMemo(() => <Progress.Line percent={getPercent} status={getStatus} />, [getPercent, getStatus]);

  return { progressViewLine: getProgressLine, status: getStatus, percent: getPercent };
}
