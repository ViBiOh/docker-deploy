import React from 'react';
import PropTypes from 'prop-types';
import FaPlus from 'react-icons/lib/fa/plus';
import FaRefresh from 'react-icons/lib/fa/refresh';
import FaUserTimes from 'react-icons/lib/fa/user-times';
import Toolbar from '../Toolbar/Toolbar';
import Button from '../Button/Button';
import Throbber from '../Throbber/Throbber';
import ContainerCard from '../ContainerCard/ContainerCard';
import style from './ContainersList.less';

/**
 * Container's list.
 * @param {Object} props Props of the component.
 * @return {React.Component} List view of containers
 */
const ContainersList = ({
  pending,
  containers,
  infos,
  error,
  onRefresh,
  onAdd,
  onSelect,
  onLogout,
}) => {
  let content;

  if (pending || !Array.isArray(containers)) {
    content = <Throbber label="Loading containers" error={error} />;
  } else {
    content = (
      <div key="containers" className={style.flex}>
        <div className={style.header}>
          <Button className={style.containers}>
            Containers{infos && infos.ServerVersion && `, daemon: ${infos.ServerVersion}`}
          </Button>
        </div>
        {containers.map(container => (
          <ContainerCard key={container.Id} container={container} onClick={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <span>
      <Toolbar error={error}>
        <Button onClick={onRefresh}>
          <FaRefresh />
        </Button>
        <Button onClick={onAdd}>
          <FaPlus />
        </Button>
        <span className={style.fill} />
        <Button onClick={onLogout} type="danger">
          <FaUserTimes />
        </Button>
      </Toolbar>
      {content}
    </span>
  );
};

ContainersList.displayName = 'ContainersList';

ContainersList.propTypes = {
  pending: PropTypes.bool,
  containers: PropTypes.arrayOf(PropTypes.shape({})),
  infos: PropTypes.shape({}),
  error: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

ContainersList.defaultProps = {
  pending: false,
  containers: null,
  infos: null,
  error: '',
};

export default ContainersList;
