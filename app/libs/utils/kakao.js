import axios from 'axios';
import qs from 'qs';

export const getToken = async function (code) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirectUri: `${process.env.CLIENT_HOST}/auth/kakao/callback`,
        code: code
      })
    });
    let statusCode = response.status;
    let kakaoToken = response.data;
    if (statusCode === 200) {
      return kakaoToken;
    } else {
      return response.statusText;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const getUserProfile = async function (accessToken) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: `Bearer ${accessToken}`
      }
    });
    const kakaoAccount = response.data.kakao_account;
    const userData = {
      phone_NO: kakaoAccount.phone_number,
      kakao_token: response.data.id,
      profile_img: kakaoAccount.profile.profile_image_url
    };
    return userData;
  } catch (err) {
    console.log(err);
    return err;
  }
};
