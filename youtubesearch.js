const search = require('youtube-search');
const creds = require('./credentials');
const _ = require('lodash');

const searchForParkourVideos = () =>
  new Promise((success, failure) =>
    search(
      'parkour',
      {
        maxResults: 10,
        key: creds.youtube
      },
      (err, results) =>
        err ? failure(err)
        : success(results)));

const getLatestVideo = videos =>
      _.chain(videos)
      .map(video => Object.assign({}, video, {
        publishedAt: new Date(video.publishedAt)
      }))
      .sortBy(['publishedAt'])
      .reverse()
      .head()
      .value();

const formatVideoForPhone = video => `${video.title}
${video.channelTitle}
${video.link}
${video.description}`;

const getFirstParkourVideo = () =>
      searchForParkourVideos()
      .then(videos => Promise.resolve(getLatestVideo(videos)))
      .then(video => Promise.resolve(formatVideoForPhone(video)));

module.exports = {
  getFirstParkourVideo
};

// getFirstParkourVideo()
// .then(result =>
// {
//   console.log("result:", result);
// })
// .catch(err => console.log("err:", err));