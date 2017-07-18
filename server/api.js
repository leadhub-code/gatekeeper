import { Router } from 'express'
import AWS from 'aws-sdk'

import configuration from './configuration'

const router = Router();

AWS.config.credentials = new AWS.Credentials({
  accessKeyId: configuration.get('aws:access_key_id'),
  secretAccessKey: configuration.get('aws:access_key_secret'),
});

console.info('Configured AWS access key id:', configuration.get('aws:access_key_id'));

const s3 = new AWS.S3();

router.get('/api/s3/prefixes', (req, res) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }
  const s3bucketName = configuration.get('aws:s3_bucket');
  const prefixesWithIndex = [];

  const listFolders = (prefix) => {
    const listParams = {
      'Bucket': s3bucketName,
      'Delimiter': '/',
      'Prefix': prefix,
    }
    return s3.listObjectsV2(listParams).promise().then((listData) => {
      //console.info(prefix, JSON.stringify(listData));
      const contents = listData['Contents'];
      if (contents) {
        const keys = contents.map((x) => x['Key']);
        const filenames = keys.map((k) => k.split('/').reverse()[0]);
        const hasIndex = filenames.findIndex((s) => s == 'index.html') !== -1;
        if (hasIndex) {
          prefixesWithIndex.push(prefix);
          return;
        }
      }
      if (listData['CommonPrefixes']) {
        const promises = listData['CommonPrefixes'].map((cp) => {
          return listFolders(cp['Prefix']);
        });
        return Promise.all(promises);
      }
    });
  };

  listFolders('').then((data) => {
    //console.info('done', data);
    //console.info('prefixesWithIndex:', JSON.stringify(prefixesWithIndex));
    res.json({ prefixesWithIndex });
  }).catch((err) => {
    console.info(req.path, 'err:', err);
    res.status(500).send('Error: ' + JSON.stringify(err));
  });
});

router.get('/s3/*', (req, res) => {
  if (!req.user) {
    res.redirect('/');
    return;
  }
  let path = req.path.substr(4);
  if (path.endsWith('/')) {
    path += 'index.html';
  }
  const s3bucketName = configuration.get('aws:s3_bucket');
  const params = {
    'Bucket': s3bucketName,
    'Key': path,
  };
  s3.getObject(params).promise().then((data) => {
    //console.info(data);
    if (data['ContentType']) {
      res.set('Content-Type', data['ContentType']);
    }
    res.set('Cache-Control', 'private, max-age=60');
    if (data['Body']) {
      res.send(data['Body']);
    } else {
      res.json({ data });
    }
  }).catch((err) => {
    res.status(500).send('Error: ' + JSON.stringify(err));
  })
});


export default router
