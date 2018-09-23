import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';


/*
  Thread List Component

  Displays list of threads for a given board.
*/
@connect(
  state => ({
    tag: state.activeBoard.tag,
    threads: state.activeBoard.threads
}))
class ThreadList extends Component {
  static get propTypes() {
    return {
      tag: PropTypes.string.isRequired,
      threads: PropTypes.arrayOf(PropTypes.object).isRequired,
    };
  }

  createListItems() {
    return this.props.threads.map(thread =>
      (
        <div className="three columns" key={thread.id}>
          <Link
            className="thread-box"
            to={{ pathname: '/boards/' + this.props.tag + '/' + thread.id }}
          >
            <img src={thread.image} alt={thread.title} />
            <div className="thread-oppost">
              <h4>{thread.title}</h4>
              <p>{thread.blurb}</p>
              <br />
                views: {thread.views} replies: {thread.replyCount} images: {thread.imageCount}
            </div>
          </Link>
        </div>
      ));
  }

  render() {
    return (
      <div id="board-feed">
        {this.createListItems()}
      </div>
    );
  }
}

export default ThreadList;
