import Head from 'next/head'

export default (props) => (
  <Head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css" />
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Lato:700" rel="stylesheet" />
    <style>{`
      body {
        font-family: Roboto, sans-serif;
        font-weight: 400;
        font-size: 16px;
        padding: 2rem 0;
      }
      h1 {
        font-family: Lato, Roboto, sans-serif;
        font-weight: 700;
        font-size: 35px;
        margin-top: 1rem;
        margin-bottom: 2rem;
      }
      li {
        margin-top: .4rem;
      }
      li li {
        margin-top: .1rem;
      }
      strong {
        font-weight: 600;
      }
      a {
        color: #04a;
      }
    `}</style>
  </Head>
)
