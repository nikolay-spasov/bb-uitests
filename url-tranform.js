exports.transfom = (originalUrl) => {
    return originalUrl.replace(/^https:\/\/www/, 'https://dev');
}