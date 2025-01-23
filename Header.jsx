import React, { useState, useEffect, useContext, memo } from 'react';
import { Badge, Animation } from 'rsuite';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Off, Notice, Member } from '@rsuite/icons';

import { useStore } from '@/core/hooks';
import { showLoader } from '@/core/reducers/actions';
import { postRequest } from '@/core/base';

import { logoUsers, logo } from '@assets/images';
import { titleCurrentLink } from '@/core/configs';

import { useSessionStorage } from '@/core/hooks';

import HeaderItem from './HeaderItem';

export const Header = ({ showDrop, setShowDrop }) => {
  const [{ title }, setR, remove, clear] = useSessionStorage('role', '');
  const [{ email, notificationCount, active }] = useSessionStorage('user', '');
  const [{ id, name_ru, second_name_ru }] = useSessionStorage('client', '');

  const [message, setMessage] = useState('');
  const { state, dispatch } = useStore();

  const [placement, setPlacement] = useState('right');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Получение кол сообещений через вебсокеты (нач)
  var channel = window.Echo.channel('user-info-' + JSON.parse(sessionStorage.user).id);
  channel.listen('.userNotification', function (data) {
    setMessage(data);
  });

  useEffect(() => {
    if (message.status === 'success' || message.status === 'process') state.createNotification(message.message, 'success');
    else if (message.status === 'fail') state.createNotification(message.message, 'error');
    else if (message.status === 'info') state.createNotification(message.message, 'info');
  }, [message]);

  useEffect(() => setShowDrop(false), [pathname]);
  useEffect(() => {
    if (+active === 0) clickProfile();
  }, [active]);

  const goToBackLink = () => {
    dispatch(showLoader({ goToBackLink: 1 }));

    postRequest('/api/v1/user/logout')
      .then(() => {
        navigate('/');
        clear();
        window.location.reload();
        dispatch(showLoader({ goToBackLink: 0 }));
      })
      .catch((err) => dispatch(showLoader({ goToBackLink: 0, status: err.status })));
  };

  const clickReset = () => {
    setShowDrop(!showDrop);
  };

  const clickProfile = () => {
    clickReset();
    navigate(`/profileUser/${id ? id : 'admin'}`);
  };
  const clickNotice = () => {
    navigate(`/noticeTransport/${id ? id : 'admin'}`);
  };

  const clickBack = () => {
    clickReset();
    goToBackLink();
  };
  const handleToggle = (placement) => {
    return (e) => {
      e.stopPropagation();
      clickReset();
      setPlacement(placement);
    };
  };

  const ViewInfo = () => {
    return `${title ? title : ''} ${name_ru ? name_ru : ''} ${second_name_ru ? second_name_ru : ''} ${email ? email : ''} `;
  };

  const Panel = React.forwardRef(({ ...props }, ref) => (
    <div className="panelItem" {...props} ref={ref} style={styleSheets.Panel}>
      <div className="bottomItem">
        <div className="itemElement">
          <h6>ПОЛЬЗОВАТЕЛЬ</h6>
        </div>

        <div className="itemElement" style={styleSheets.itemElement}>
          <label onClick={clickProfile}>
            <Member />
            <p>Профиль пользователя</p>
          </label>
        </div>
        <div className="itemElement">
          <div className="goToBack">
            <label onClick={clickBack}>
              <Off />
              <button>Выход</button>
            </label>
          </div>
        </div>
      </div>
    </div>
  ));
  Panel.displayName = 'Panel';

  const styleSheets = {
    Panel: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      color: '#fff',
      zIndex: 100,
    },
    itemElement: { borderBottom: '1px solid #e9ecef' },
  };

  return (
    <div className="headerItem">
      <HeaderItem />

      <div className="header-inner">
        <div className="itemLeft">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>
        <div>
          <h4>{titleCurrentLink(pathname)}</h4>
        </div>
        <div className="itemRight">
          <div className="topItem">
            <div className={notificationCount > 0 ? 'notificationUser--note' : 'notificationUser'} onClick={clickNotice}>
              <Badge content={notificationCount}>
                <Notice />
              </Badge>
            </div>
            <p>{ViewInfo()}</p>

            <div className="LogoUser" onClick={handleToggle('top')}>
              <img src={logoUsers} alt="LogoUser" />
            </div>
          </div>
          <div onMouseLeave={clickReset}>
            <Animation.Slide unmountOnExit transitionAppear timeout={300} in={showDrop} placement={placement}>
              {(props, ref) => <Panel {...props} ref={ref} />}
            </Animation.Slide>
          </div>
        </div>
      </div>
    </div>
  );
};
