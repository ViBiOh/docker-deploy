import React from 'react';
import style from './Container.css';

const ContainerNetwork = ({ container }) => {
  if ((container.NetworkSettings.Networks &&
       Object.keys(container.NetworkSettings.Networks).length === 0) &&
    (container.NetworkSettings.Ports &&
     Object.keys(container.NetworkSettings.Ports).length === 0)) {
    return null;
  }

  return (
    <span className={style.container}>
      <h3>Network</h3>
      <span className={style['labels-container']}>
        {
          container.NetworkSettings.Networks && Object.keys(container.NetworkSettings.Networks)
            .map(network => (
              <span key={network} className={style['label-item']}>
                {network} | {container.NetworkSettings.Networks[network].IPAddress}
              </span>
            ))
        }
        {
          container.NetworkSettings.Ports && Object.keys(container.NetworkSettings.Ports)
            .filter(port => container.NetworkSettings.Ports[port])
            .map(port => (
              <span key={port} className={style['label-item']}>
                {port} | {container.NetworkSettings.Ports[port].map(p => p.HostPort).join(', ')}
              </span>
            ))
        }
      </span>
    </span>
  );
};

ContainerNetwork.displayName = 'ContainerNetwork';

ContainerNetwork.propTypes = {
  container: React.PropTypes.shape({
    NetworkSettings: React.PropTypes.shape({
      Ports: React.PropTypes.shape({}),
      Networks: React.PropTypes.shape({}),
    }).isRequired,
  }).isRequired,
};

export default ContainerNetwork;
