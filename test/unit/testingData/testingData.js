module.exports = {
  nonexistentLogin: 'nonexistentLogin',
  existentLogin: 'admin1',
  userID: 63,
  newUserInfo: {
    userLogin:"test"+Math.floor((Math.random() * 100000)),
    userRealname:'test test test',
    userEmail:'sdfsdfdsf_1999@mail.ru',
    userPassword: 'testpass',
    rePass: 'testpass'
  },
  loginInfo: {
    userLogin: 'admin1',
    userPassword: '123456'
  },
  wrongLoginInfo: {
    userLogin: 'admin1',
    userPassword: '12345'
  },
  newBidData: {
    street: 10000063,
    house: 103,
    flat: 12,
    categories: 1,
    subCategories: 2,
    bidMessage: 'Поломка',
    lat: 0,
    lng: 0,
    changed_manually: 0,
    bid_street: 910000043,
    bid_house: 16,
    bid_flat: 1,
    isBidOnUserAddress: 0
  },
  newBidDataOnUserAddress: {
    street: 10000063,
    house: 103,
    flat: 12,
    categories: 1,
    subCategories: 2,
    bidMessage: 'Поломка',
    lat: 0,
    lng: 0,
    changed_manually: 0,
    bid_street: 910000043,
    bid_house: 16,
    bid_flat: 1,
    isBidOnUserAddress: 1
  },
  wrongHash: 'h1a2s3h4',
  url: 'http://127.0.0.1:3000'
};
