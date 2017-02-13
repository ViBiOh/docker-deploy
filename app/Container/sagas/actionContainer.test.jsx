/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env mocha */
import { expect } from 'chai';
import { call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import DockerService from '../../Service/DockerService';
import { actionContainerSucceeded, actionContainerFailed, fetchContainer, fetchContainers } from '../actions';
import { actionContainerSaga } from './';

describe('ActionContainer Saga', () => {
  it('should call DockerService service from given name with given id', () => {
    const iterator = actionContainerSaga({
      action: 'start',
      id: 'test',
    });

    expect(
      iterator.next().value,
    ).to.deep.equal(
      call(DockerService.start, 'test'),
    );
  });

  it('should put success after API call', () => {
    const iterator = actionContainerSaga({
      action: 'start',
    });
    iterator.next();

    expect(
      iterator.next().value,
    ).to.deep.equal(
      put(actionContainerSucceeded()),
    );
  });

  it('should put fetch container after API call', () => {
    const iterator = actionContainerSaga({
      action: 'start',
      id: 'test',
    });
    iterator.next();
    iterator.next();

    expect(
      iterator.next().value,
    ).to.deep.equal(
      put(fetchContainer('test')),
    );
  });

  it('should put fetch containers and go home after delete API call', () => {
    const iterator = actionContainerSaga({
      action: 'delete',
      id: 'test',
    });
    iterator.next();
    iterator.next();

    expect(
      iterator.next().value,
    ).to.deep.equal([
      put(fetchContainers()),
      put(push('/')),
    ]);
  });

  xit('should put error on failure', () => {
    const iterator = actionContainerSaga({});

    expect(
      iterator.throw({ content: 'Test error' }).value,
    ).to.deep.equal(
      put(actionContainerFailed('Test error')),
    );
  });
});