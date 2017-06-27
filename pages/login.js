import Head from 'next/head'

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

class IndexPage extends React.Component {

  static async getInitialProps ({ req }) {
    return {
      siteTitle: req ? req.siteTitle : null,
    }
  }

  render() {
    const { siteTitle } = this.props;
    return (
      <div>
        <IndexHead />
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <h1>{siteTitle}</h1>
              <a href="/auth/google/">Sign in with Google</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default IndexPage;
