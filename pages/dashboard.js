import Head from 'next/head'
import 'isomorphic-fetch'

const IndexHead = () => (
  <Head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css?family=Roboto:300" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:300" rel="stylesheet" />
    <style>{`
      body {
        font-family: Roboto, sans-serif;
        font-weight: 300;
        font-size: 14px;
        margin: 1rem 0;
      }
      h1 {
        font-family: 'Roboto Condensed', sans-serif;
        font-weight: 300;
        font-size: 35px;
        margin-top: 1rem;
        margin-bottom: 2rem;
      }
    `}</style>
  </Head>
)

const Spinner = () => (
  <span><img src="https://i0.wp.com/cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif?resize=32%2C32" /></span>
)

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
    const res = await fetch('/api/s3/prefixes')
    const { prefixesWithIndex } = await res.json()
    this.setState({ prefixesWithIndex });
  }

  render() {
    const { siteTitle } = this.props;
    const { prefixesWithIndex } = this.state;
    const links = prefixesWithIndex.map((prefix) => (
      <li key={prefix}><a href={'/s3/' + prefix}>{prefix}</a></li>
    ))


    return (
      <div>
        <IndexHead />
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <h1>{siteTitle}</h1>
              {links.length > 0 ? <ul>{links}</ul> : <Spinner />}
              {/*<pre style={{color: '#ccc'}}>{JSON.stringify(this.props, null, 2)}</pre>*/}
              {/*<pre style={{color: '#ccc'}}>{JSON.stringify(this.state, null, 2)}</pre>*/}
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default IndexPage;
