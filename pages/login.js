import { Container, Button } from 'semantic-ui-react'

import CustomHead from '../components/CustomHead'

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
        <CustomHead />
        <Container text>
          <h1>{siteTitle}</h1>
          <Button
            as='a'
            href='/auth/google/'
            color='google plus'
            content='Sign in with Google'
            icon='google'
            labelPosition='left'
          />
        </Container>
      </div>
    )
  }

}

export default IndexPage;
