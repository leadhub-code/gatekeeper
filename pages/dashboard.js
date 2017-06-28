import 'isomorphic-fetch'

import CustomHead from '../components/CustomHead'

const Spinner = () => (
  <span><img src="https://i0.wp.com/cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif?resize=32%2C32" /></span>
)

const Links = (props) => {
  const prefixes = props.prefixes.slice();
  prefixes.sort();
  if (!prefixes || prefixes.length == 0) {
    return (<Spinner />);
  }
  const groups = new Map();
  for (const prefix of prefixes) {
    const stripped = prefix.endsWith('/') ? prefix.substr(0, prefix.length - 1) : prefix;
    const parts = stripped.split('/', 2);
    if (parts.length == 1) {
      groups.set(parts[0], { label: stripped, link: '/s3/' + prefix });
    } else if (parts.length == 2) {
      if (!groups.has(parts[0])) {
        groups.set(parts[0], { label: parts[0], children: [] });
      }
      groups.get(parts[0]).children.push({ label: parts[1], link: '/s3/' + prefix });
    }
  }
  const groupKeys = Array.from(groups.keys());
  groupKeys.sort();
  const items = groupKeys.map((key) => {
    const value = groups.get(key);
    if (value.link) {
      return (
        <li key={key}>
          <strong><a href={value.link}>{value.label}</a></strong>
        </li>
      );
    }
    if (value.children) {
      return (
        <li key={key}>
          <strong>{value.label}</strong>
          <ul>
            {value.children.map((x) => (
              <li key={x.label}>
                <a href={x.link}>{x.label}</a>
              </li>
            ))}
          </ul>
        </li>
      );
    }
  });
  return (<ul>{items}</ul>);
}

class IndexPage extends React.Component {

  static async getInitialProps ({ req }) {
    return {
      siteTitle: req ? req.siteTitle : null,
      user: req ? req.user : null,
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      prefixesWithIndex: [],
    };
  }

  async componentDidMount() {
    const res = await fetch('/api/s3/prefixes', { credentials: 'same-origin' });
    // ^^^ https://stackoverflow.com/questions/34558264/fetch-api-with-cookie
    const { prefixesWithIndex } = await res.json();
    this.setState({ prefixesWithIndex });
  }

  render() {
    const { siteTitle } = this.props;
    const { prefixesWithIndex } = this.state;
    return (
      <div>
        <CustomHead />
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <h1>{siteTitle}</h1>
              <Links prefixes={prefixesWithIndex} />
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default IndexPage;
