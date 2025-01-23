import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@/core/hooks';

import './Popup.scss';
import { postRequest } from '@/core/base';
import { useSessionStorage } from '@/core/hooks';
import { useNavigate } from 'react-router-dom';

const staticTxt = {
  title: 'Упс...',
  description:
    'Вы были неактивны длительное время. В целях безопасности был произведен выход из платформы. Если Вы хотите продолжить заниматься, осуществите повторный вход в систему.',
  btnLabel: 'Войти в систему',
};
const MINUTES = 15 * 60 * 1000;

const PopupFunc = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const [user, setUser, remove, clear] = useSessionStorage('user', '');
  const { state } = useStore();

  let timer;

  useEffect(() => {
    // Очистка sessionStorage при всплытии модалки

    if (show) clear();

    deleteBlockAuto(MINUTES);

    return () => {
      clearTimeout(timer);
    };
  }, [show, state.loading]);

  const deleteBlockAuto = (time) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      postRequest('/api/v1/user/logout').catch((err) => {
        state.createNotification(err?.message ?? 'Что-то пошло не так!', 'error');
      });

      setShow(true);
    }, time);
  };
  const check = show && !!user;

  const popupLogout = () => {
    navigate('/');
    clear();
    window.location.reload();
  };

  return (
    check &&
    createPortal(
      <div className="nPopup">
        <div className="nPopup-content">
          <div className="nPopup-title">{staticTxt.title}</div>
          <div className="text">{staticTxt.description}</div>
          <button onClick={popupLogout}>{staticTxt.btnLabel}</button>
        </div>
      </div>,
      document.getElementById('nPopup'),
    )
  );
};

export default PopupFunc;
