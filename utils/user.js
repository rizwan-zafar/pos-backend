const bcrypt = require('bcryptjs');
const users = [
  {
    name: 'Richard E. Romero',
    email: 'richard@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '828-896-3442',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Brain H. Landry',
    email: 'brain@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '714-200-5488',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Thomas',
    email: 'thomas@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '818-363-8091',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Danielle R. Martin',
    email: 'danielle@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '831-539-6621',
    /*notification: [],
    seennotification: []*/
  },

  {
    name: 'Linda',
    email: 'linda@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '801-844-8271',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Eddie N. Garcia',
    email: 'eddie@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '917-313-4731',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Williams',
    email: 'williams@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '714-776-3942',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Gordon C. Lowery',
    email: 'gordon@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '858-243-0632',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Lester J. Massey',
    email: 'lester@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '715-657-9865',
    /*notification: [],
    seennotification: []*/
  },

  {
    name: 'Samuel',
    email: 'samuel@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '307-202-3590',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Henry M. Koch',
    email: 'henry@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '912-587-2159',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Kathryn J. Brown',
    email: 'kathryn@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '707-275-4858',
    /*notification: [],
    seennotification: []*/
  },

  {
    name: 'Josephine M. Peel',
    email: 'josephine@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '734-256-1159',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Justin J. Ruiz',
    email: 'justin@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '212-512-2888',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Aurora E. Amerson',
    email: 'aurora@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '660-515-7629',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Christopher M. Fox',
    email: 'christopher@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '812-886-0550',
    /*notification: [],
    seennotification: []*/
  },

  {
    name: 'James J. Allen',
    email: 'james@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '818-356-8600',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Hilary W. Becker',
    email: 'hilary@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '802-516-2269',
    /*notification: [],
    seennotification: []*/
  },

  {
    name: 'Jon B. Krueger',
    email: 'jon@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '360-943-7332',
    /*notification: [],
    seennotification: []*/
  },
  {
    name: 'Paul R. Bruns',
    email: 'paul@gmail.com',
    password: bcrypt.hashSync('12345678'),
    phone: '715-651-7487',
    /*notification: [],
    seennotification: []*/
  },
];

module.exports = users;
