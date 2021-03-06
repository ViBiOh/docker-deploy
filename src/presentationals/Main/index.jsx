import React from 'react';
import PropTypes from 'prop-types';
import style from './index.css';

/**
 * Component wrapper for App.
 * @param {Object} props Props of the component.
 * @return {React.Component} Wrapper of App
 */
export default function Main({ children }) {
  return (
    <span className={style.layout}>
      <article className={style.article}>{children}</article>
    </span>
  );
}

Main.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
