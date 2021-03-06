import actions from 'actions';

/**
 * Start error regex.
 * @type {RegExp}
 */
const startError = /_FAILED$/;

/**
 * End error regex.
 * @type {RegExp}
 */
const endError = /_SUCCEEDED$/;

/**
 * Error's reducer initial state.
 * @type {String}
 */
export const initialState = '';

/**
 * Error's reducer.
 * @param  {Object} state  Existing error's state
 * @param  {Object} action Action dispatched
 * @return {Object}        New state
 */
export default function(state = initialState, action) {
  if (action.type === actions.SET_ERROR || startError.test(action.type)) {
    if (global.Rollbar) {
      global.Rollbar.error(action.error);
    }

    return String(action.error);
  }

  if (endError.test(action.type)) {
    return initialState;
  }

  return state;
}
