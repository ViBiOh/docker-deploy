import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import FaPlus from 'react-icons/lib/fa/plus';
import FaRefresh from 'react-icons/lib/fa/refresh';
import FaUser from 'react-icons/lib/fa/user';
import FaUserTimes from 'react-icons/lib/fa/user-times';
import DockerService from '../Service/DockerService';
import Toolbar from '../Toolbar/Toolbar';
import Button from '../Button/Button';
import Throbber from '../Throbber/Throbber';
import ContainerCard from './ContainerCard';
import style from './Containers.css';

export default class Containers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };

    this.fetchContainers = this.fetchContainers.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentDidMount() {
    this.fetchContainers();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchContainers() {
    this.setState({ loaded: false });

    return DockerService.containers()
      .then((containers) => {
        if (this.mounted) {
          this.setState({
            loaded: true,
            containers,
          });
        }

        return containers;
      })
      .catch((error) => {
        if (this.mounted) {
          this.setState({ error: error.content });
        }

        return error;
      });
  }

  renderContainers() {
    let content;

    if (this.state.loaded) {
      content = (
        <div key="list" className={style.flex}>
          {
            this.state.containers.map(container => (
              <ContainerCard key={container.Id} container={container} />
            ))
          }
        </div>
      );
    } else {
      content = <Throbber label="Loading containers" error={this.state.error} />;
    }

    return (
      <span>
        <Toolbar>
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
        </Toolbar>
        {content}
      </span>
    );
  }

  render() {
    return this.renderContainers();
  }
}