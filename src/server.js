const app = require('./app');
// const env = require('./config/env');
const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});