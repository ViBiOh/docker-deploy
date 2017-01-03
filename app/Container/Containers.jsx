import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import FaPlus from 'react-icons/lib/fa/plus';
import FaRefresh from 'react-icons/lib/fa/refresh';
import FaUser from 'react-icons/lib/fa/user';
import FaUserTimes from 'react-icons/lib/fa/user-times';
import DockerService from '../Service/DockerService';
import Button from '../Button/Button';
import ContainerCard from './ContainerCard';
import Throbber from '../Throbber/Throbber';
import style from './Containers.css';

export default class Containers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };

    this.fetchContainers = this.fetchContainers.bind(this);
  }

  componentDidMount() {
    this.fetchContainers();
  }

  fetchContainers() {
    this.setState({ loaded: false });

    return DockerService.containers()
      .then((containers) => {
        this.setState({
          loaded: true,
          containers,
        });

        return containers;
      })
      .catch((error) => {
        this.setState({ error: error.content });
        return error;
      });
  }

  renderContainers() {
    if (this.state.loaded) {
      return (
        <span>
          <span className={style.flex}>
            <Button onClick={this.fetchContainers}>
              <FaRefresh />
            </Button>
            {
              DockerService.isLogged() && (
                <Button onClick={() => browserHistory.push('/containers/New')}>
                  <FaPlus /> Add an app
                </Button>
              )
            }
            <span className={style.growingFlex} />
            {
              !DockerService.isLogged() && (
                <Button onClick={() => browserHistory.push('/login')}>
                  <FaUser />
                </Button>
              )
            }
            {
              DockerService.isLogged() && (
                <Button
                  onClick={() => DockerService.logout().then(this.fetchContainers)}
                  type="danger"
                >
                  <FaUserTimes />
                </Button>
              )
            }
          </span>
          <div key="list" className={style.flex}>
            {
              this.state.containers.map(container => (
                <ContainerCard key={container.Id} container={container} />
              ))
            }
          </div>
        </span>
      );
    }

    return <Throbber label="Loading containers" error={this.state.error} />;
  }

  render() {
    return this.renderContainers();
  }
}
