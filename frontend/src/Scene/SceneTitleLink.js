import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Link from 'Components/Link/Link';

class SceneTitleLink extends PureComponent {

  render() {
    const {
      foreignId,
      title,
      year
    } = this.props;

    const link = `/scene/${foreignId}`;

    return (
      <Link
        to={link}
        title={title}
      >
        {title}{year > 0 ? ` (${year})` : ''}
      </Link>
    );
  }
}

SceneTitleLink.propTypes = {
  foreignId: PropTypes.string.isRequired,
  titleSlug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.number
};

export default SceneTitleLink;
